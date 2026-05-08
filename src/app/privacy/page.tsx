import type { Metadata } from "next";
import Link from "next/link";
import { Brain, ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Globe, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — JPsyche",
  description:
    "Learn how JPsyche collects, uses, and protects your personal information and conversation data.",
};

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="group">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-xl font-bold text-on-surface">{title}</h2>
    </div>
    <div className="pl-12 text-on-surface-variant leading-relaxed space-y-3 text-[15px]">
      {children}
    </div>
  </section>
);

export default function PrivacyPage() {
  return (
    <div className="flex-1 overflow-y-auto w-full bg-background text-on-background font-sans">
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

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <Shield className="w-3.5 h-3.5" />
            Your Privacy Matters
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant text-base max-w-xl mx-auto leading-relaxed">
            At JPsyche, we handle your information with the utmost care — especially given the sensitive nature of mental health conversations.
          </p>
          <p className="mt-3 text-on-surface-variant/60 text-sm">
            Last updated: <time dateTime="2026-05-04">May 4, 2026</time>
          </p>
        </div>

        {/* Disclaimer Banner */}
        <div className="mb-10 bg-primary/5 border border-primary/20 rounded-2xl p-5 text-sm text-on-surface-variant leading-relaxed">
          <strong className="text-primary font-semibold">Important Notice:</strong> JPsyche is an AI-powered support tool and is <em>not</em> a licensed medical or psychiatric service. No conversation with JPsyche constitutes a clinical relationship. Please review this policy carefully to understand how your data is managed.
        </div>

        <div className="space-y-12">
          {/* 1. Information We Collect */}
          <Section icon={Database} title="Information We Collect">
            <p>We collect the following categories of information when you use JPsyche:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-on-surface">Account Information:</strong> When you sign up via Clerk, we collect your email address, name, and profile details as provided by you or your OAuth provider (e.g., Google).
              </li>
              <li>
                <strong className="text-on-surface">Conversation Data:</strong> Messages you exchange with the JPsyche AI are stored in our database to enable session continuity and conversation history.
              </li>
              <li>
                <strong className="text-on-surface">Usage Metadata:</strong> Chat session titles, timestamps, and session counts to improve service quality.
              </li>
              <li>
                <strong className="text-on-surface">Technical Data:</strong> Browser type, device type, and anonymised IP address for security and diagnostics.
              </li>
            </ul>
            <p className="mt-3">Guest users (unauthenticated) may send up to 3 messages; those messages are <strong className="text-on-surface">not</strong> stored in our database.</p>
          </Section>

          {/* 2. How We Use Your Information */}
          <Section icon={Eye} title="How We Use Your Information">
            <p>Your information is used exclusively to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Provide and personalise the JPsyche AI support experience.</li>
              <li>Maintain conversation history so you can resume sessions.</li>
              <li>Authenticate your identity and secure your account via Clerk.</li>
              <li>Generate contextual AI responses using the OpenAI API; your conversation history is forwarded to OpenAI within each session for this purpose.</li>
              <li>Diagnose technical issues and improve platform reliability.</li>
            </ul>
            <p className="mt-3">We <strong className="text-on-surface">do not</strong> sell your data, share it for advertising, or use it to train AI models without your explicit consent.</p>
          </Section>

          {/* 3. AI & Third-Party Processing */}
          <Section icon={Globe} title="AI Processing & Third-Party Services">
            <p>JPsyche relies on trusted third-party services:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              {/* <li>
                <strong className="text-on-surface">OpenAI (GPT-4o-mini):</strong> Your messages are sent to OpenAI's API to generate AI responses. OpenAI's{" "}
                <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80 transition-opacity">
                  privacy policy
                </a>{" "}
                governs their handling of this data.
              </li> */}
              <li>
                <strong className="text-on-surface">Clerk:</strong> Authentication and user management is handled by Clerk. Their{" "}
                <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80 transition-opacity">
                  privacy policy
                </a>{" "}
                applies to your sign-in data.
              </li>
              <li>
                <strong className="text-on-surface">Neon (PostgreSQL):</strong> Conversation data is stored in a Neon serverless database with encryption at rest.
              </li>
            </ul>
          </Section>

          {/* 4. Data Security */}
          <Section icon={Lock} title="Data Security">
            <p>We implement industry-standard protections including:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>TLS/HTTPS encryption for all data in transit.</li>
              <li>Encryption at rest for database storage via Neon.</li>
              <li>Clerk&apos;s secure session management with short-lived tokens.</li>
              <li>API routes are protected with server-side authentication checks.</li>
            </ul>
            <p className="mt-3">However, no system is completely infallible. We recommend you do not share information that you would consider extremely confidential (e.g. legal or financial details) in any AI chat service.</p>
          </Section>

          {/* 5. Mental Health Data */}
          <Section icon={UserCheck} title="Mental Health Conversations">
            <p>We recognise that conversations about mental health are especially sensitive. We commit to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Never disclosing conversation content to third parties for commercial purposes.</li>
              <li>Providing you with full control to delete your chat history at any time from within the app.</li>
              <li>Not using conversation content to make automated decisions that affect you outside the app.</li>
            </ul>
            <p className="mt-3">
              <strong className="text-on-surface">If you are in crisis</strong>, please contact a licensed mental health professional immediately. See our{" "}
              <Link href="/crisis" className="text-primary underline hover:opacity-80 transition-opacity font-semibold">
                Crisis Resources
              </Link>{" "}
              page.
            </p>
          </Section>

          {/* 6. Your Rights */}
          <Section icon={Shield} title="Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong className="text-on-surface">Access</strong> — Request a copy of the data we hold about you.</li>
              <li><strong className="text-on-surface">Deletion</strong> — Request deletion of your account and all associated conversation data.</li>
              <li><strong className="text-on-surface">Rectification</strong> — Correct inaccurate personal information.</li>
              <li><strong className="text-on-surface">Data Portability</strong> — Receive your data in a portable format.</li>
              <li><strong className="text-on-surface">Opt-out</strong> — Discontinue using the service at any time.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us using the details below.</p>
          </Section>

          {/* 7. Contact */}
          <Section icon={Mail} title="Contact Us">
            <p>For privacy-related inquiries, data requests, or concerns, please reach out:</p>
            <div className="mt-3 bg-surface-container-low rounded-2xl p-5 border border-outline-variant/40">
              <p className="font-semibold text-on-surface">JPsyche Privacy Team</p>
              <p className="mt-1">
                Email:{" "}
                <a href="mailto:privacy@jpsyche.app" className="text-primary underline hover:opacity-80 transition-opacity">
                  privacy@jpsyche.app
                </a>
              </p>
              <p className="mt-1 text-sm text-on-surface-variant/70">We aim to respond to all privacy requests within 30 days.</p>
            </div>
          </Section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-outline-variant/30 flex flex-wrap gap-4 justify-center text-sm text-on-surface-variant">
          <Link href="/terms" className="hover:text-primary transition-colors underline">Terms of Service</Link>
          <span className="opacity-30">•</span>
          <Link href="/crisis" className="hover:text-primary transition-colors underline font-semibold">Crisis Resources</Link>
          <span className="opacity-30">•</span>
          <Link href="/" className="hover:text-primary transition-colors underline">Back to JPsyche</Link>
        </div>
      </main>
    </div>
  );
}
