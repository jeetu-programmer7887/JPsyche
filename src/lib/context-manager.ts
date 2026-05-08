import { GoogleGenAI } from '@google/genai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RawMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type GeminiContent = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

export type PatientMemoryProfile = {
  name: string | null;
  stressors: string[];
  mood_trend: string[];
  triggers: string[];
  coping_strategies: string[];
  key_events: string[];
  last_session_note: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of new messages since last summary before we compress again. */
export const SUMMARIZE_THRESHOLD = 15;

/** How many recent raw messages to always include verbatim in context. */
export const RECENT_MESSAGE_COUNT = 12;

/**
 * How often (in messages) to re-extract the patient memory profile.
 * Running on every message is expensive; every 5 is more than enough.
 */
export const PROFILE_EXTRACT_INTERVAL = 5;

/**
 * Faster model for structured background tasks (summarization, extraction, titles).
 * gemini-2.0-flash is significantly quicker than gemini-2.5-flash for these jobs.
 */
const BACKGROUND_MODEL = 'gemini-2.0-flash';

// ---------------------------------------------------------------------------
// 1. Build Gemini Context
// ---------------------------------------------------------------------------

/**
 * Assembles the layered context array that gets sent to Gemini.
 *
 * Layer order (oldest → newest):
 *   1. Patient memory profile  (injected as a synthetic user message)
 *   2. Session rolling summary (injected as a synthetic model message)
 *   3. Last N raw messages     (verbatim conversation)
 *
 * This keeps the total context bounded while preserving the most important
 * long-term and short-term information.
 */
export function buildGeminiContext(
  allMessages: RawMessage[],
  sessionSummary: string | null,
  memoryProfile: PatientMemoryProfile | null,
  recentCount: number = RECENT_MESSAGE_COUNT,
): GeminiContent[] {
  const context: GeminiContent[] = [];

  // Layer 1 — long-term patient profile
  if (memoryProfile && Object.keys(memoryProfile).length > 0) {
    const profileText = [
      '[PATIENT MEMORY PROFILE — use this to personalise every response]',
      `Name: ${memoryProfile.name ?? 'Unknown'}`,
      `Primary stressors: ${memoryProfile.stressors.join(', ') || 'None recorded yet'}`,
      `Mood trend: ${memoryProfile.mood_trend.join(' → ') || 'Unknown'}`,
      `Known triggers: ${memoryProfile.triggers.join(', ') || 'None recorded yet'}`,
      `Coping strategies discussed: ${memoryProfile.coping_strategies.join(', ') || 'None recorded yet'}`,
      `Key events: ${memoryProfile.key_events.join('; ') || 'None recorded yet'}`,
      `Last session note: ${memoryProfile.last_session_note || 'N/A'}`,
    ].join('\n');

    context.push({ role: 'user', parts: [{ text: profileText }] });
    context.push({
      role: 'model',
      parts: [{ text: 'Understood. I have noted the patient profile and will use it to inform my responses.' }],
    });
  }

  // Layer 2 — rolling session summary (compresses older messages)
  if (sessionSummary) {
    const summaryText = [
      '[SESSION SUMMARY — earlier conversation compressed into clinical notes]',
      sessionSummary,
    ].join('\n');

    context.push({ role: 'user', parts: [{ text: summaryText }] });
    context.push({
      role: 'model',
      parts: [{ text: 'Understood. I have reviewed the session summary and will continue from where we left off.' }],
    });
  }

  // Layer 3 — recent raw messages (verbatim, most recent N)
  const recentMessages = allMessages.slice(-recentCount);
  for (const msg of recentMessages) {
    context.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  return context;
}

// ---------------------------------------------------------------------------
// 2. Summarization Trigger Check
// ---------------------------------------------------------------------------

/**
 * Returns true when enough new messages have accumulated since the last
 * summarization to warrant generating a new compressed summary.
 */
export function shouldSummarize(
  totalMessageCount: number,
  summarizedUpTo: number,
  threshold: number = SUMMARIZE_THRESHOLD,
): boolean {
  return totalMessageCount - summarizedUpTo >= threshold;
}

// ---------------------------------------------------------------------------
// 3. Profile Extraction Throttle Check
// ---------------------------------------------------------------------------

/**
 * Returns true only every PROFILE_EXTRACT_INTERVAL messages, avoiding an
 * expensive Gemini call on every single exchange.
 *
 * e.g. with interval=5: fires at message counts 5, 10, 15, 20 ...
 */
export function shouldExtractProfile(
  totalMessageCount: number,
  interval: number = PROFILE_EXTRACT_INTERVAL,
): boolean {
  return totalMessageCount > 0 && totalMessageCount % interval === 0;
}

// ---------------------------------------------------------------------------
// 4. Generate Rolling Summary
// ---------------------------------------------------------------------------

/**
 * Calls Gemini to compress a batch of older messages into clinical session
 * notes. If a previous summary exists it is merged in.
 */
export async function generateSummary(
  ai: GoogleGenAI,
  messagesToSummarize: RawMessage[],
  existingSummary: string | null,
): Promise<string> {
  const conversationText = messagesToSummarize
    .map((m) => `${m.role === 'user' ? 'Patient' : 'JPsyche'}: ${m.content}`)
    .join('\n');

  const prompt = `You are a clinical psychiatrist writing concise session notes.
${existingSummary ? `Previous session notes:\n${existingSummary}\n\n` : ''}Compress the following new conversation into updated clinical notes (max 200 words total).
Include: presenting concerns, emotional state, key themes discussed, any coping strategies suggested, breakthroughs, and current mood trajectory.
Merge seamlessly with any previous notes. Be factual and clinical — no pleasantries or filler.

New conversation to summarise:
${conversationText}`;

  try {
    const response = await ai.models.generateContent({
      model: BACKGROUND_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.3 },
    });
    return response.text?.trim() ?? existingSummary ?? '';
  } catch (err) {
    console.error('[context-manager] Summary generation failed:', err);
    // Graceful fallback — return existing summary unchanged
    return existingSummary ?? '';
  }
}

// ---------------------------------------------------------------------------
// 5. Generate Chat Title
// ---------------------------------------------------------------------------

/**
 * Generates a short, semantic title (3–5 words) from the first user message.
 * This runs as a background task so the user never waits for it.
 */
export async function generateChatTitle(
  ai: GoogleGenAI,
  firstUserMessage: string,
): Promise<string> {
  const prompt = `Generate a concise, descriptive title (3–5 words max) for a therapy chat session that starts with this message from the patient. Return ONLY the title, no punctuation, no quotes, no explanation.

Patient's first message: "${firstUserMessage}"`;

  try {
    const response = await ai.models.generateContent({
      model: BACKGROUND_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.4, maxOutputTokens: 20 },
    });
    const title = response.text?.trim().replace(/^["']|["']$/g, '') ?? '';
    // Fallback to truncated message if something goes wrong
    return title || firstUserMessage.substring(0, 40);
  } catch (err) {
    console.error('[context-manager] Chat title generation failed:', err);
    return firstUserMessage.substring(0, 40);
  }
}

// ---------------------------------------------------------------------------
// 6. Extract & Update Patient Memory Profile
// ---------------------------------------------------------------------------

const EMPTY_PROFILE: PatientMemoryProfile = {
  name: null,
  stressors: [],
  mood_trend: [],
  triggers: [],
  coping_strategies: [],
  key_events: [],
  last_session_note: '',
};

/**
 * Calls Gemini to extract any NEW clinically relevant facts from the latest
 * exchange and merges them into the existing patient memory profile.
 *
 * Returns the updated (merged) profile. If extraction fails, returns the
 * existing profile unchanged so data is never lost.
 */
export async function extractMemoryProfile(
  ai: GoogleGenAI,
  lastExchange: { userMsg: string; assistantMsg: string },
  existingProfile: PatientMemoryProfile | null,
): Promise<PatientMemoryProfile> {
  const existing = existingProfile ?? EMPTY_PROFILE;

  const prompt = `You are a clinical psychiatrist extracting facts from a therapy exchange.
Review the exchange below and identify any NEW clinically relevant information about the patient.
Merge with the existing profile. Return ONLY a valid JSON object — no markdown, no extra text.

Existing profile:
${JSON.stringify(existing, null, 2)}

New exchange:
Patient: ${lastExchange.userMsg}
JPsyche: ${lastExchange.assistantMsg}

Return a merged JSON object with exactly these keys:
{
  "name": string | null,
  "stressors": string[],
  "mood_trend": string[],
  "triggers": string[],
  "coping_strategies": string[],
  "key_events": string[],
  "last_session_note": string
}

Rules:
- Only add genuinely NEW information not already captured.
- Append to arrays, never replace them (unless correcting an error).
- "last_session_note" should reflect the patient's current emotional state in 1–2 sentences.
- If nothing new is found, return the existing profile unchanged.`;

  try {
    const response = await ai.models.generateContent({
      model: BACKGROUND_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.2 },
    });

    const raw = response.text?.trim() ?? '';

    // Strip markdown code fences if the model wraps in ```json ... ```
    const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    const parsed: PatientMemoryProfile = JSON.parse(jsonText);

    // Basic validation — ensure required keys exist
    const requiredKeys: (keyof PatientMemoryProfile)[] = [
      'name', 'stressors', 'mood_trend', 'triggers',
      'coping_strategies', 'key_events', 'last_session_note',
    ];
    for (const key of requiredKeys) {
      if (!(key in parsed)) throw new Error(`Missing key: ${key}`);
    }

    return parsed;
  } catch (err) {
    console.error('[context-manager] Profile extraction failed:', err);
    // Graceful fallback — return existing profile unchanged
    return existing;
  }
}
