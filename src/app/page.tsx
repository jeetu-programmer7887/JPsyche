"use client";

import * as React from "react";
import { Plus, Send, Menu, Brain, Copy, Check, Pencil, X, Loader2, Volume2, Square } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Sidebar } from "@/components/sidebar";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import Image from "next/image";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Message = {
  role: "user" | "assistant";
  content: string;
  thought?: string;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
};

function Show({ when, children }: { when: "signed-in" | "signed-out"; children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  if (!isLoaded) return null;
  if (when === "signed-in" && userId) return <>{children}</>;
  if (when === "signed-out" && !userId) return <>{children}</>;
  return null;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hello. I'm JPsyche... How are you feeling today?",
};

export default function Home() {
  const { userId } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    setIsSidebarOpen(window.innerWidth >= 768);
  }, []);
  const [chats, setChats] = React.useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = React.useState(false);
  const [isLimitWarningDismissed, setIsLimitWarningDismissed] = React.useState(false);

  const [messages, setMessages] = React.useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Copy & Edit state
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editInput, setEditInput] = React.useState("");
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  // TTS state
  const [speakingIndex, setSpeakingIndex] = React.useState<number | null>(null);
  const voicesRef = React.useRef<SpeechSynthesisVoice[]>([]);

  // SWR for fetching chats with caching
  const { data: swrData } = useSWR(userId ? "/api/chats" : null, fetcher, {
    revalidateOnFocus: false,
  });

  // Refs for auto-scrolling and auto-resizing
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Load voices and stop speech on unmount
  React.useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      voicesRef.current = synth.getVoices();
    };
    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);
    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
      synth.cancel();
    };
  }, []);

  // Sync SWR data with local state
  React.useEffect(() => {
    if (swrData?.chats) {
      const fetchedChats = swrData.chats as ChatSession[];
      // Only set local chats for guest/optimistic if needed, 
      // but we'll use swrData directly for display.
      // setChats(fetchedChats); 

      // Auto-select first chat only on initial load if none active
      if (!activeChatId && fetchedChats.length > 0 && !isLoadedFromStorage) {
        setActiveChatId(fetchedChats[0].id);
        setMessages(fetchedChats[0].messages);
      }
      setIsLoadedFromStorage(true);
    } else if (!userId && !isLoadedFromStorage) {
      setChats([]);
      setActiveChatId(null);
      setMessages([INITIAL_MESSAGE]);
      setIsLoadedFromStorage(true);
    }
  }, [swrData, userId, activeChatId, isLoadedFromStorage]);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Dynamic Resizing Logic
  React.useEffect(() => {
    if (textareaRef.current) {
      // Reset height to calculate scrollHeight correctly
      textareaRef.current.style.height = "auto";
      // Set height based on content (max-h-32 in tailwind will still limit this)
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Strip markdown symbols so TTS reads naturally
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/gs, '$1')
      .replace(/\*(.*?)\*/gs, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
      .replace(/^\s*[-*+]\s/gm, '')
      .replace(/^\s*\d+\.\s/gm, '')
      .replace(/>\s?/g, '')
      .trim();
  };

  // Detect if text is primarily Hindi (Devanagari Unicode block: \u0900-\u097F)
  const detectLang = (text: string): string => {
    const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
    return hindiChars > 5 ? 'hi-IN' : 'en-US';
  };

  // Pick the best available voice for a given lang tag
  const getBestVoice = (lang: string): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current;
    if (!voices.length) return null;

    const langPrefix = lang.split('-')[0]; // 'hi' or 'en'

    // 1. Exact lang match + Neural/Enhanced in name (Edge/Chrome neural voices)
    const neural = voices.find(
      v => v.lang.startsWith(langPrefix) &&
        /neural|enhanced|natural/i.test(v.name)
    );
    if (neural) return neural;

    // 2. Exact lang match + Google voice (Chrome ships these)
    const google = voices.find(
      v => v.lang.startsWith(langPrefix) && /google/i.test(v.name)
    );
    if (google) return google;

    // 3. Any voice with the right lang prefix
    const langMatch = voices.find(v => v.lang.startsWith(langPrefix));
    if (langMatch) return langMatch;

    // 4. Default fallback
    return voices.find(v => v.default) ?? voices[0] ?? null;
  };

  const speakMessage = (text: string, index: number) => {
    const synth = window.speechSynthesis;
    if (speakingIndex === index) {
      synth.cancel();
      setSpeakingIndex(null);
      return;
    }
    synth.cancel();

    const lang = detectLang(stripMarkdown(text));
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    utterance.lang = lang;

    const voice = getBestVoice(lang);
    if (voice) utterance.voice = voice;

    // Tune rate/pitch: Hindi benefits from a slightly slower rate
    utterance.rate = lang === 'hi-IN' ? 0.88 : 0.95;
    utterance.pitch = 1;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    synth.speak(utterance);
  };

  const parseResponse = (text: string) => {
    const thoughtMatch = text.match(/\[Thought:\s*(.*?)\]/is);
    let thought = "";
    let content = text;
    if (thoughtMatch) {
      thought = thoughtMatch[1];
      content = text.replace(thoughtMatch[0], "").trim();
    }
    return { thought, content };
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([INITIAL_MESSAGE]);
    setEditingIndex(null);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectChat = (id: string) => {
    const currentChats = swrData?.chats || chats;
    const chat = currentChats.find((c: ChatSession) => c.id === id);
    if (chat) {
      setActiveChatId(chat.id);
      setMessages(chat.messages);
    }
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    // Optimistic update
    setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    if (userId) {
      await fetch("/api/chats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: id, title: newTitle }),
      });
      mutate("/api/chats");
    }
  };

  const handleDeleteChat = async (id: string) => {
    const wasActive = activeChatId === id;
    // Optimistic update
    setChats(prev => prev.filter(c => c.id !== id));
    if (wasActive) {
      setActiveChatId(null);
      setMessages([INITIAL_MESSAGE]);
    }
    if (userId) {
      await fetch("/api/chats", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: id }),
      });
      mutate("/api/chats");
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback silently
    }
  };

  const startEditing = (index: number, content: string) => {
    setEditingIndex(index);
    setEditInput(content);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditInput("");
  };

  const isGuestLimitReached = !userId && (messages.filter(m => m.role === "user").length >= 3);

  const sendMessage = async (overrideInput?: string, isEdit = false, editIndex?: number) => {
    if (isGuestLimitReached) return;
    const textToSend = overrideInput ?? input;
    if (!textToSend.trim() || isLoading) return;

    // If editing: fork the conversation at the edited message's index
    const baseMessages = (isEdit && editIndex !== undefined)
      ? messages.slice(0, editIndex)  // drop the edited msg and everything after
      : messages;

    const newMessages = [...baseMessages, { role: "user" as const, content: textToSend.trim() }];
    setMessages(newMessages);
    if (isEdit) cancelEditing();

    // Clear input and reset textarea height
    if (!overrideInput) {
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
      }
    }

    setIsLoading(true);

    let currentChatId = activeChatId;
    if (!currentChatId) {
      currentChatId = Date.now().toString();
      setActiveChatId(currentChatId);

      const newChat: ChatSession = {
        id: currentChatId,
        title: textToSend.trim().substring(0, 30) + (textToSend.length > 30 ? "..." : ""),
        updatedAt: Date.now(),
        messages: newMessages
      };
      setChats(prev => [newChat, ...prev].sort((a, b) => b.updatedAt - a.updatedAt));
    } else {
      setChats(prev => prev.map(c =>
        c.id === currentChatId
          ? { ...c, messages: newMessages, updatedAt: Date.now() }
          : c
      ).sort((a, b) => b.updatedAt - a.updatedAt));
    }

    try {
      const titleCandidate = textToSend.trim().substring(0, 30) + (textToSend.length > 30 ? "..." : "");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          chatId: currentChatId !== activeChatId ? null : currentChatId, // send null if it's a completely new one that hasn't been synced to DB yet. Oh wait, activeChatId is null when new.
          title: titleCandidate,
        }),
      });

      if (!res.ok) throw new Error("API response error");

      const data = await res.json();
      const { thought, content } = parseResponse(data.reply);

      const serverChatId = data.chatId;
      if (serverChatId && !activeChatId) {
        setActiveChatId(serverChatId);
        currentChatId = serverChatId;
      }

      const finalMessages = [...newMessages, { role: "assistant" as const, content, thought }];
      setMessages(finalMessages);

      setChats(prev => prev.map(c =>
        c.id === currentChatId
          ? { ...c, messages: finalMessages, updatedAt: Date.now() }
          : c
      ).sort((a, b) => b.updatedAt - a.updatedAt));

    } catch (error) {
      console.error(error);
      const errorMessages = [
        ...newMessages,
        { role: "assistant" as const, content: "I'm sorry, I'm having trouble connecting right now." },
      ];
      setMessages(errorMessages);

      setChats(prev => prev.map(c =>
        c.id === currentChatId
          ? { ...c, messages: errorMessages, updatedAt: Date.now() }
          : c
      ).sort((a, b) => b.updatedAt - a.updatedAt));
    } finally {
      setIsLoading(false);
      // Revalidate SWR cache to keep sidebar in sync
      if (userId) {
        mutate("/api/chats");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[100dvh] w-full relative overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={swrData?.chats || chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-[100dvh] transition-all duration-400">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md bg-surface/80 dark:bg-inverse-surface/80 border-b border-outline-variant/30 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 cursor-pointer hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant ${isSidebarOpen ? "md:hidden" : ""}`}
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center sm:flex">
                <Brain className="w-5 h-5" />
              </div>
              <div className="text-primary dark:text-primary-fixed-dim font-bold text-2xl tracking-tight sm:block">
                JPsyche
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-medium hover:text-primary transition-colors cursor-pointer hidden md:block">Log In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-medium bg-primary text-on-primary px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer">Sign Up</button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
            </Show>
            <ThemeToggle />
          </div>
        </header>

        {/* Chat Thread */}
        <main className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 md:px-8 pt-6 pb-44 space-y-6 flex flex-col scroll-smooth">
          <div className="flex justify-center">
            <span className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Today
            </span>
          </div>

          {messages.map((msg, i) => (
            <React.Fragment key={i}>
              {msg.role === "assistant" ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="flex flex-col items-start max-w-[85%] group/msg"
                >
                  <div className="bg-surface-container-low text-on-surface px-5 py-3.5 rounded-2xl rounded-tl-none shadow-sm leading-relaxed flex flex-col gap-3">
                    {msg.thought && (
                      <div className="border-l-4 border-primary/40 pl-3 py-1 text-on-surface-variant text-sm">
                        <span className="font-semibold not-italic text-primary/70 text-xs uppercase tracking-wider block mb-1">Thought</span>
                        <div className="italic">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
                              li: ({ children }) => <li>{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold not-italic">{children}</strong>,
                            }}
                          >
                            {msg.thought}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    <div className="text-[15px] leading-relaxed">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Assistant action row: Speak + Copy */}
                  <div className="flex items-center gap-1 mt-1 ml-1 opacity-100 md:opacity-0 md:group-hover/msg:opacity-100 transition-opacity">
                    <button
                      onClick={() => speakMessage(msg.content, i)}
                      title={speakingIndex === i ? "Stop speaking" : "Read aloud"}
                      className="p-1.5 cursor-pointer rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {speakingIndex === i
                        ? <Square className="w-3.5 h-3.5 text-primary" />
                        : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.content, i)}
                      title="Copy"
                      className="p-1.5 cursor-pointer rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {copiedIndex === i
                        ? <Check className="w-3.5 h-3.5 text-primary" />
                        : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Quick Chips for the very first message */}
                  {i === 0 && messages.length === 1 && !isLoading && !activeChatId && (
                    <div className="flex flex-wrap gap-2 mt-3 ml-2">
                      {["Work Deadlines", "Personal Errands", "Everything combined"].map((chip, idx) => (
                        <motion.button
                          key={chip}
                          onClick={() => sendMessage(`I've been feeling a bit overwhelmed lately with ${chip.toLowerCase()}.`)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: 0.6 + idx * 0.1 }}
                          className="px-4 py-2 cursor-pointer bg-surface border border-outline-variant/60 rounded-full text-[13px] font-medium hover:bg-surface-container-low hover:border-outline-variant transition-colors text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50 text-left"
                        >
                          {chip}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="flex flex-col items-end self-end max-w-[85%] ml-auto group/msg"
                >
                  {editingIndex === i ? (
                    /* ── Edit mode ── */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full flex flex-col gap-2"
                    >
                      <textarea
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(editInput, true, i);
                          }
                          if (e.key === "Escape") cancelEditing();
                        }}
                        rows={3}
                        className="w-full bg-surface border border-outline-variant/60 rounded-2xl px-4 py-3 text-on-surface text-[15px] resize-none outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={cancelEditing}
                          className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full text-[13px] font-medium border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button
                          onClick={() => sendMessage(editInput, true, i)}
                          disabled={!editInput.trim() || isLoading}
                          className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full text-[13px] font-medium bg-primary text-on-primary hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                        >
                          {isLoading
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Send className="w-3.5 h-3.5" />}
                          Save & Submit
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── Normal user bubble ── */
                    <div className="bg-primary text-on-primary px-5 py-3.5 rounded-2xl rounded-tr-none shadow-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  )}

                  {/* User action row: Edit + Copy — always visible on mobile, hover on desktop */}
                  {editingIndex !== i && (
                    <div className="flex items-center gap-1 mt-1 mr-1 opacity-100 md:opacity-0 md:group-hover/msg:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(i, msg.content)}
                        disabled={isLoading}
                        title="Edit message"
                        className="p-1.5 cursor-pointer rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(msg.content, i)}
                        title="Copy"
                        className="p-1.5 cursor-pointer rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        {copiedIndex === i
                          ? <Check className="w-3.5 h-3.5 text-primary" />
                          : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </React.Fragment>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-start max-w-[85%]"
            >
              <div className="bg-surface-container-low px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-[52px]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }}></span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-16 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background to-transparent z-40 pointer-events-none">
          <div className="max-w-3xl mx-auto flex flex-col gap-3 relative pointer-events-auto px-1 sm:px-6">
            {isGuestLimitReached && !isLimitWarningDismissed ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative flex flex-col items-center justify-center p-6 bg-surface/95 backdrop-blur-md border border-outline-variant/50 rounded-[24px] shadow-lg text-center"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsLimitWarningDismissed(true)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-on-surface-variant hover:bg-on-surface/10 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Brain className="w-6 h-6" />
                </div>

                <h3 className="text-on-surface font-semibold text-lg mb-1">Free Trial Limit Reached</h3>

                <p className="text-on-surface-variant text-sm mb-4 max-w-sm">
                  You&apos;ve used your 3 free chats. Please log in or sign up to continue your session and save your progress.
                </p>

                <div className="flex items-center gap-3">
                  <SignInButton mode="modal">
                    <button className="text-sm font-medium hover:bg-surface-container-low px-4 py-2 rounded-full transition-colors cursor-pointer border border-outline-variant">
                      Log In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="text-sm font-medium bg-primary text-on-primary px-4 py-2 rounded-full hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-primary/20">
                      Sign Up Free
                    </button>
                  </SignUpButton>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-end gap-2 bg-surface/90 backdrop-blur-md border border-outline-variant/50 rounded-[24px] p-1 shadow-lg shadow-outline-variant/10 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-transparent transition-all"
              >
                <button type="button" className="p-2.5 cursor-pointer text-on-surface-variant hover:bg-surface-container-low hover:text-primary rounded-full transition-colors shrink-0">
                  <Image
                    src="/mental-health.png"
                    alt="Button Icon"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </button>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[44px] py-3 text-on-surface placeholder:text-on-surface-variant/60 font-medium disabled:opacity-50 scrollbar-hide"
                  placeholder="Message JPsyche..."
                  rows={1}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-primary text-on-primary rounded-full shadow-md shadow-primary/20 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shrink-0 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                >
                  <Send className="w-5 h-5 ml-0.5" strokeWidth={2} />
                </button>
              </motion.div>
            )}

            <p className="text-[11px] text-center text-on-surface-variant/70 px-4 leading-relaxed mb-2">
              Personalized psychiatric support... JPsyche is an AI assistant and not a substitute for clinical advice.<br className="hidden sm:block" />
              <Link href="/privacy" className="underline hover:text-primary transition-colors">Privacy Policy</Link> {" • "}
              <Link href="/terms" className="underline hover:text-primary transition-colors">Terms</Link> {" • "}
              <Link href="/crisis" className="underline hover:text-primary font-semibold transition-colors">Crisis Resources</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}