"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  MessageSquare,
  Edit,
  Volume2,
  Trash2,
  HelpCircle,
  Shield,
  AlertCircle,
  Sparkles,
  UserCircle,
  Mail,
  ArrowLeft,
} from "lucide-react";

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    className="group"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-xl font-bold text-on-surface">{title}</h2>
    </div>
    <div className="pl-12 text-on-surface-variant leading-relaxed space-y-3 text-[15px]">
      {children}
    </div>
  </motion.section>
);

export default function HelpPage() {
  return (
    <div className="flex-1 min-h-screen bg-background text-on-background font-sans overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-surface/80 border-b border-outline-variant/30">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-primary font-bold text-xl tracking-tight">JPsyche</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16 pb-32">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <HelpCircle className="w-3.5 h-3.5" />
            Help & Support
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 leading-tight">
            Welcome to JPsyche
          </h1>
          <p className="text-on-surface-variant text-base max-w-xl mx-auto leading-relaxed">
            Your AI-powered companion for mental health support and emotional well-being. Learn how to make the most of your experience.
          </p>
        </motion.div>

        {/* Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-10 bg-primary/5 border border-primary/20 rounded-2xl p-5 text-sm text-on-surface-variant leading-relaxed"
        >
          <strong className="text-primary font-semibold">Important Notice:</strong> JPsyche is an AI assistant designed to provide supportive conversations. It is <em>not</em> a substitute for professional medical advice, diagnosis, or treatment. If you&apos;re experiencing a crisis, please visit our{" "}
          <Link href="/crisis" className="text-primary underline hover:opacity-80 transition-opacity font-semibold">
            Crisis Resources
          </Link>{" "}
          page immediately.
        </motion.div>

        <div className="space-y-12">
          {/* Introduction */}
          <Section icon={Brain} title="Getting Started">
            <p>
              JPsyche uses advanced AI to provide empathetic, thoughtful responses to your mental health concerns. Whether you&apos;re feeling stressed, anxious, or just need someone to talk to, JPsyche is here to listen.
            </p>
            <p>
              <strong className="text-on-surface">How to start:</strong> Simply type your message in the input box at the bottom of the screen and press Enter or click the send button. JPsyche will respond with supportive guidance tailored to your needs.
            </p>
          </Section>

          {/* Features */}
          <Section icon={Sparkles} title="Core Features">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <strong className="text-on-surface">Chat Conversations</strong>
                </div>
                <p className="text-sm">
                  Have natural, flowing conversations with JPsyche. Each message is analyzed in context to provide relevant, personalized responses.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Edit className="w-4 h-4 text-primary" />
                  <strong className="text-on-surface">Edit Messages</strong>
                </div>
                <p className="text-sm">
                  Made a typo? Click the edit icon on any of your messages. The conversation will continue from that point with your updated message.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Volume2 className="w-4 h-4 text-primary" />
                  <strong className="text-on-surface">Text-to-Speech</strong>
                </div>
                <p className="text-sm">
                  Listen to JPsyche&apos;s responses by clicking the speaker icon. This feature supports multiple languages and natural-sounding voices.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Trash2 className="w-4 h-4 text-primary" />
                  <strong className="text-on-surface">Chat Management</strong>
                </div>
                <p className="text-sm">
                  Create multiple chat sessions, rename them for easy reference, or delete conversations you no longer need.
                </p>
              </div>
            </div>
          </Section>

          {/* Account Info */}
          <Section icon={UserCircle} title="Account Features">
            <p>
              <strong className="text-on-surface">Guest Mode:</strong> Try JPsyche with up to 3 free messages without creating an account. Guest conversations are not saved.
            </p>
            <p>
              <strong className="text-on-surface">Authenticated Users:</strong> Sign up for a free account to unlock:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Unlimited chat sessions</li>
              <li>Conversation history saved securely via Neon database</li>
              <li>Access from multiple devices via Clerk authentication</li>
              <li>Personalized session titles and organization</li>
            </ul>
          </Section>

          {/* Privacy & Safety */}
          <Section icon={Shield} title="Privacy & Safety">
            <p>
              Your privacy is our top priority. All conversations are encrypted and stored securely. We never share your personal information or chat content with third parties for commercial purposes.
            </p>
            <div className="mt-3 space-y-2">
              <p>
                <strong className="text-on-surface">Quick Links:</strong>
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/privacy" className="text-primary underline hover:opacity-80 transition-opacity">Privacy Policy</Link>
                <Link href="/terms" className="text-primary underline hover:opacity-80 transition-opacity">Terms of Service</Link>
                <Link href="/crisis" className="text-primary underline hover:opacity-80 transition-opacity font-semibold">Crisis Resources</Link>
              </div>
            </div>
          </Section>

          {/* Support */}
          <Section icon={Mail} title="Need More Help?">
            <p>
              If you have questions, feedback, or need technical support, we&apos;re here to help.
            </p>
            <div className="mt-3 bg-surface-container-low rounded-2xl p-5 border border-outline-variant/40 max-w-md">
              <p className="font-semibold text-on-surface">Contact Support</p>
              <p className="mt-1">
                Email:{" "}
                <a
                  href="mailto:support@jpsyche.app"
                  className="text-primary underline hover:opacity-80 transition-opacity"
                >
                  support@jpsyche.app
                </a>
              </p>
              <p className="mt-1 text-xs text-on-surface-variant/70">
                We typically respond within 24-48 hours.
              </p>
            </div>
          </Section>

          {/* Crisis Warning */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-12 bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                  In Crisis?
                </h3>
                <p className="text-on-surface-variant text-[15px] leading-relaxed">
                  If you&apos;re experiencing a mental health emergency or having thoughts of self-harm, please reach out to a crisis helpline immediately. JPsyche cannot provide emergency support.
                </p>
                <Link
                  href="/crisis"
                  className="inline-flex items-center gap-2 mt-3 bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
                >
                  <AlertCircle className="w-4 h-4" />
                  View Crisis Resources
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Links */}
        <div className="mt-20 pt-8 border-t border-outline-variant/30 flex flex-wrap gap-4 justify-center text-sm text-on-surface-variant">
          <Link href="/terms" className="hover:text-primary transition-colors underline">Terms</Link>
          <span className="opacity-30">•</span>
          <Link href="/privacy" className="hover:text-primary transition-colors underline">Privacy</Link>
          <span className="opacity-30">•</span>
          <Link href="/crisis" className="hover:text-primary transition-colors underline font-semibold">Crisis Help</Link>
          <span className="opacity-30">•</span>
          <Link href="/" className="hover:text-primary transition-colors underline">Back to JPsyche</Link>
        </div>
      </main>
    </div>
  );
}