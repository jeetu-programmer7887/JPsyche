import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    if (!dbUser) {
      // Return empty array if user hasn't created any chats yet
      return NextResponse.json({ chats: [] });
    }

    const chats = await prisma.chatSession.findMany({
      where: { userId: dbUser.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          // Limit payload — load only the most recent 50 messages per session
          take: 50,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Format the response to match the frontend expectations
    const formattedChats = chats.map(chat => ({
      id: chat.id,
      title: chat.title,
      updatedAt: chat.updatedAt.getTime(),
      messages: chat.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        thought: msg.thought || undefined,
      })),
    }));

    return NextResponse.json({ chats: formattedChats });
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching chats.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const { chatId, title } = await req.json();
    if (!chatId || !title?.trim()) {
      return NextResponse.json({ error: 'chatId and title are required' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkUserId: userId }, select: { id: true } });
    if (!dbUser) return new NextResponse('User not found', { status: 404 });

    const updated = await prisma.chatSession.updateMany({
      where: { id: chatId, userId: dbUser.id },
      data: { title: title.trim() },
    });

    if (updated.count === 0) return new NextResponse('Not found', { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error renaming chat:', error);
    return NextResponse.json({ error: 'Failed to rename chat' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const { chatId } = await req.json();
    if (!chatId) return NextResponse.json({ error: 'chatId is required' }, { status: 400 });

    const dbUser = await prisma.user.findUnique({ where: { clerkUserId: userId }, select: { id: true } });
    if (!dbUser) return new NextResponse('User not found', { status: 404 });

    const deleted = await prisma.chatSession.deleteMany({
      where: { id: chatId, userId: dbUser.id },
    });

    if (deleted.count === 0) return new NextResponse('Not found', { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
