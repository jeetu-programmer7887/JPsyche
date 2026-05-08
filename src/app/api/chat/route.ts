import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  buildGeminiContext,
  shouldSummarize,
  shouldExtractProfile,
  generateSummary,
  generateChatTitle,
  extractMemoryProfile,
  type RawMessage,
  type PatientMemoryProfile,
} from '@/lib/context-manager';

// --- Logic to pick the API key based on 10-minute intervals ---
function getRotatedApiKey() {
  const minutes = new Date().getMinutes();

  if (minutes < 10) {
    return process.env.GEMINI_API_KEY1;
  } else if (minutes < 20) {
    return process.env.GEMINI_API_KEY2;
  } else if (minutes < 30) {
    return process.env.GEMINI_API_KEY3;
  } else if (minutes < 40) {
    return process.env.GEMINI_API_KEY1;
  } else if (minutes < 50) {
    return process.env.GEMINI_API_KEY2;
  } else {
    return process.env.GEMINI_API_KEY3;
  }
}

const ai = new GoogleGenAI({
  // apiKey: getRotatedApiKey(),
  apiKey: process.env.GEMINI_API_KEY2,
});

const SYSTEM_PROMPT = `You are JPsyche, an empathetic virtual psychiatrist. 
Crucially, before responding to the user, you MUST output your internal monologue reflecting on the user's state and your clinical approach. 
You must format this strictly as: [Thought: your thoughts here] followed immediately by your actual response to the user.
Example:
[Thought: Validate their feelings of overwhelm and gently ask what specifically is causing the most stress right now.] It sounds like you're carrying a very heavy load. When you feel overwhelmed, is there a particular area of your life that stands out as the most stressful?`;

export async function POST(req: Request) {
  try {
    // -----------------------------------------------------------------------
    // Phase 1 — Auth & basic validation (fast, no DB yet)
    // -----------------------------------------------------------------------
    const { userId } = await auth();

    if (!process.env.GEMINI_API_KEY3) {
      return NextResponse.json(
        { error: 'Gemini API key not configured.' },
        { status: 500 }
      );
    }

    const { messages, chatId, title } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format.' },
        { status: 400 }
      );
    }

    // Cast incoming messages to the shared type
    const incomingMessages: RawMessage[] = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content as string,
    }));

    let currentChatId = chatId;
    let dbUserId: string | null = null;
    let sessionSummary: string | null = null;
    let summarizedUpTo = 0;
    let memoryProfile: PatientMemoryProfile | null = null;
    let isNewChat = false;

    // -----------------------------------------------------------------------
    // Phase 2 — DB setup (authenticated users only)
    // Two sub-phases run in parallel where possible:
    //   2a. Upsert user (no Clerk network call — clerkUserId alone is enough)
    //   2b. Handle chat session (after we have dbUserId)
    // -----------------------------------------------------------------------
    if (userId) {
      // 2a. Upsert user — no currentUser() network call needed
      const dbUser = await prisma.user.upsert({
        where: { clerkUserId: userId },
        update: {},
        create: { clerkUserId: userId },
        select: { id: true, memoryProfile: true },
      });

      dbUserId = dbUser.id;
      memoryProfile = (dbUser.memoryProfile as PatientMemoryProfile | null) ?? null;

      // 2b. Handle chat session
      if (!currentChatId) {
        isNewChat = true;
        const newSession = await prisma.chatSession.create({
          data: {
            title: title || 'New Session',
            userId: dbUserId,
          },
          select: { id: true, summary: true, summarizedUpTo: true },
        });
        currentChatId = newSession.id;
        sessionSummary = newSession.summary;
        summarizedUpTo = newSession.summarizedUpTo;
      } else {
        // Run session lookup + touch (updatedAt) in a single update call
        const updatedSession = await prisma.chatSession.update({
          where: { id: currentChatId },
          data: { updatedAt: new Date() },
          select: { id: true, userId: true, summary: true, summarizedUpTo: true },
        });

        if (updatedSession.userId !== dbUserId) {
          return new NextResponse('Unauthorized', { status: 401 });
        }

        sessionSummary = updatedSession.summary;
        summarizedUpTo = updatedSession.summarizedUpTo;
      }

      // 2c. Save incoming user message (fire-and-forget — don't await)
      const lastMessage = incomingMessages[incomingMessages.length - 1];
      if (lastMessage.role === 'user') {
        prisma.message.create({
          data: {
            role: 'user',
            content: lastMessage.content,
            chatSessionId: currentChatId,
          },
        }).catch((err) => console.error('[chat/route] Failed to save user message:', err));
      }
    }

    // -----------------------------------------------------------------------
    // Phase 3 — Build smart layered context
    // -----------------------------------------------------------------------
    const geminiContents = buildGeminiContext(
      incomingMessages,
      sessionSummary,
      memoryProfile,
    );

    // -----------------------------------------------------------------------
    // Phase 4 — Generate AI response
    // -----------------------------------------------------------------------
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: geminiContents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I encountered an error while processing that.';

    // -----------------------------------------------------------------------
    // Phase 5 — Parse thought block
    // -----------------------------------------------------------------------
    const thoughtMatch = reply.match(/\[Thought:\s*(.*?)\]/i);
    let thought = '';
    let content = reply;
    if (thoughtMatch) {
      thought = thoughtMatch[1];
      content = reply.replace(thoughtMatch[0], '').trim();
    }

    // -----------------------------------------------------------------------
    // Phase 6 — Return response immediately
    // -----------------------------------------------------------------------
    const apiResponse = NextResponse.json({ reply, chatId: currentChatId });

    // -----------------------------------------------------------------------
    // Phase 7 — Fire-and-forget background tasks (user never waits)
    // -----------------------------------------------------------------------
    if (userId && currentChatId && dbUserId) {
      const lastUserMsg = incomingMessages[incomingMessages.length - 1];
      const totalMsgCount = incomingMessages.length;

      Promise.all([
        // Task A — save assistant message to DB
        prisma.message.create({
          data: {
            role: 'assistant',
            content,
            thought: thought || null,
            chatSessionId: currentChatId,
          },
        }),

        // Task B — rolling summary (only when threshold is reached)
        (async () => {
          if (shouldSummarize(totalMsgCount, summarizedUpTo)) {
            const olderMessages = incomingMessages.slice(0, -12);
            if (olderMessages.length === 0) return;

            const newSummary = await generateSummary(ai, olderMessages, sessionSummary);

            await prisma.chatSession.update({
              where: { id: currentChatId },
              data: {
                summary: newSummary,
                summarizedUpTo: totalMsgCount - 12,
              },
            });
          }
        })(),

        // Task C — extract patient memory profile (throttled: every 5 messages)
        (async () => {
          if (!shouldExtractProfile(totalMsgCount)) return;
          if (lastUserMsg?.role !== 'user') return;

          const updatedProfile = await extractMemoryProfile(
            ai,
            { userMsg: lastUserMsg.content, assistantMsg: content },
            memoryProfile,
          );

          await prisma.user.update({
            where: { clerkUserId: userId },
            data: { memoryProfile: updatedProfile as any },
          });
        })(),

        // Task D — generate a proper AI title for brand-new chats
        (async () => {
          if (!isNewChat) return;
          if (lastUserMsg?.role !== 'user') return;

          const aiTitle = await generateChatTitle(ai, lastUserMsg.content);

          await prisma.chatSession.update({
            where: { id: currentChatId },
            data: { title: aiTitle },
          });
        })(),
      ]).catch((err) =>
        console.error('[chat/route] Background task failed:', err)
      );
    }

    return apiResponse;
  } catch (error: any) {
    console.error('Gemini/Prisma Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during the request.' },
      { status: 500 }
    );
  }
}
