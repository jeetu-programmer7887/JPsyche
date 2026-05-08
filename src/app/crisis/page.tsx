"use client";
import Link from "next/link";
import { Brain, ArrowLeft, Phone, MessageSquare, Globe, Heart, AlertOctagon, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

type ResourceLine = {
  name: string;
  number: string;
  description: string;
  available: string;
  type: string;
  url?: string;
};

type ResourceRegion = {
  region: string;
  lines: ResourceLine[];
};

const resources: ResourceRegion[] = [
  {
    region: "🇮🇳 India",
    lines: [
      {
        name: "iCall (TISS)",
        number: "9152987821",
        description: "Free psychosocial support helpline run by the Tata Institute of Social Sciences.",
        available: "Mon–Sat, 8 am–10 pm",
        type: "call",
      },
      {
        name: "Vandrevala Foundation",
        number: "1860-2662-345",
        description: "24/7 mental health helpline offering free crisis counselling.",
        available: "24 / 7",
        type: "call",
      },
      {
        name: "AASRA",
        number: "9820466627",
        description: "Suicide prevention helpline providing emotional support to those in despair.",
        available: "24 / 7",
        type: "call",
      },
      {
        name: "Snehi",
        number: "044-24640050",
        description: "Emotional support and crisis intervention service based in Chennai.",
        available: "24 / 7",
        type: "call",
      },
    ],
  },
  {
    region: "🇺🇸 United States",
    lines: [
      {
        name: "988 Suicide & Crisis Lifeline",
        number: "988",
        description: "Call or text 988 to reach a trained crisis counsellor, available 24/7.",
        available: "24 / 7",
        type: "call",
      },
      {
        name: "Crisis Text Line",
        number: "Text HOME to 741741",
        description: "Free, 24/7 crisis support via text message.",
        available: "24 / 7",
        type: "text",
      },
      {
        name: "NAMI Helpline",
        number: "1-800-950-6264",
        description: "National Alliance on Mental Illness information and support line.",
        available: "Mon–Fri, 10 am–10 pm ET",
        type: "call",
      },
    ],
  },
  {
    region: "🇬🇧 United Kingdom",
    lines: [
      {
        name: "Samaritans",
        number: "116 123",
        description: "Free, 24/7 confidential emotional support for anyone in distress.",
        available: "24 / 7",
        type: "call",
      },
      {
        name: "CALM",
        number: "0800 58 58 58",
        description: "Campaign Against Living Miserably helpline for people in the UK.",
        available: "5 pm–midnight",
        type: "call",
      },
      {
        name: "Shout Crisis Text Line",
        number: "Text SHOUT to 85258",
        description: "Free, confidential 24/7 mental health text support.",
        available: "24 / 7",
        type: "text",
      },
    ],
  },
  {
    region: "🌍 International",
    lines: [
      {
        name: "Befrienders Worldwide",
        number: "befrienders.org",
        description: "Worldwide directory of emotional support centres and crisis lines.",
        available: "Varies by country",
        type: "web",
        url: "https://www.befrienders.org",
      },
      {
        name: "International Association for Suicide Prevention",
        number: "iasp.info/resources/Crisis_Centres",
        description: "Directory of crisis centres and helplines across the globe.",
        available: "Varies by country",
        type: "web",
        url: "https://www.iasp.info/resources/Crisis_Centres/",
      },
    ],
  },
];

const typeIcon = (type: string) => {
  if (type === "text") return <MessageSquare className="w-4 h-4" />;
  if (type === "web") return <Globe className="w-4 h-4" />;
  return <Phone className="w-4 h-4" />;
};

const typeColor = (type: string) => {
  if (type === "text") return "bg-violet-500/10 text-violet-600 dark:text-violet-400";
  if (type === "web") return "bg-sky-500/10 text-sky-600 dark:text-sky-400";
  return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
};

export default function CrisisPage() {
  return (
    <div className="flex-1 overflow-y-auto w-full bg-background text-on-background font-sans">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-surface/80 border-b border-outline-variant/30">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-primary font-bold text-xl tracking-tight">JPsyche</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <Heart className="w-3.5 h-3.5" />
            You Are Not Alone
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 leading-tight">
            Crisis Resources
          </h1>
          <p className="text-on-surface-variant text-base max-w-xl mx-auto leading-relaxed">
            If you are in immediate danger or experiencing a mental health emergency, please reach out to one of the resources below. Help is available right now.
          </p>
        </div>

        {/* Emergency Banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                Are you in immediate danger?
              </h2>
              <p className="text-on-surface-variant text-[15px] leading-relaxed">
                If you or someone else is in immediate danger, <strong className="text-on-surface">call your local emergency number right away</strong> — 
                <strong className="text-on-surface"> 112 or 100</strong> in India, <strong className="text-on-surface">911</strong> in the US, <strong className="text-on-surface">999</strong> in the UK.
              </p>
              <p className="text-on-surface-variant/70 text-sm mt-2">
                JPsyche is an AI assistant and is <em>not</em> equipped to handle real-time emergencies. These resources are staffed by trained human counsellors.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Grounding Reminder */}
        <div className="mb-12 bg-primary/5 border border-primary/20 rounded-2xl p-6">
          <h2 className="text-base font-bold text-primary mb-3">A Quick Grounding Exercise</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-3">
            If you feel overwhelmed right now, try this before reaching out — it can help slow racing thoughts:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-on-surface-variant">
            <li>Name <strong className="text-on-surface">5 things</strong> you can see around you.</li>
            <li>Name <strong className="text-on-surface">4 things</strong> you can physically touch.</li>
            <li>Name <strong className="text-on-surface">3 things</strong> you can hear.</li>
            <li>Name <strong className="text-on-surface">2 things</strong> you can smell.</li>
            <li>Name <strong className="text-on-surface">1 thing</strong> you can taste.</li>
          </ol>
          <p className="text-on-surface-variant/70 text-xs mt-4">
            This is the 5-4-3-2-1 grounding technique. Then please reach out to one of the helplines below.
          </p>
        </div>

        {/* Resource Lists */}
        <div className="space-y-12">
          {resources.map((region, ri) => (
            <motion.section
              key={region.region}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: ri * 0.1 }}
            >
              <h2 className="text-xl font-bold text-on-surface mb-5">{region.region}</h2>
              <div className="grid gap-4">
                {region.lines.map((line) => (
                  <div
                    key={line.name}
                    className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor(line.type)}`}>
                            {typeIcon(line.type)}
                            {line.type === "call" ? "Call" : line.type === "text" ? "Text" : "Web"}
                          </span>
                          <span className="text-xs text-on-surface-variant/60">{line.available}</span>
                        </div>
                        <h3 className="font-bold text-on-surface text-[15px]">{line.name}</h3>
                        <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">{line.description}</p>
                      </div>
                      <div className="shrink-0">
                        {line.url ? (
                          <a
                            href={line.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity bg-primary/10 px-4 py-2 rounded-full"
                          >
                            Visit <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <a
                            href={line.type === "call" ? `tel:${line.number.replace(/\s/g, "")}` : undefined}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:opacity-80 transition-opacity bg-primary/10 px-4 py-2 rounded-full whitespace-nowrap"
                          >
                            {line.number}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Additional Support */}
        <div className="mt-16 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/40 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-3">You Matter</h2>
          <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-lg mx-auto">
            Recovery is possible. Millions of people have navigated what you are going through and found their way to a better place. Reaching out — whether to JPsyche, a helpline, or a trusted person in your life — is a sign of strength, not weakness.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
            >
              <Brain className="w-4 h-4" />
              Talk to JPsyche
            </Link>
            <a
              href="https://www.mentalhealth.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-outline-variant/60 px-6 py-2.5 rounded-full text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <Globe className="w-4 h-4" />
              MentalHealth.gov
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-outline-variant/30 flex flex-wrap gap-4 justify-center text-sm text-on-surface-variant">
          <Link href="/privacy" className="hover:text-primary transition-colors underline">Privacy Policy</Link>
          <span className="opacity-30">•</span>
          <Link href="/terms" className="hover:text-primary transition-colors underline">Terms of Service</Link>
          <span className="opacity-30">•</span>
          <Link href="/" className="hover:text-primary transition-colors underline">Back to JPsyche</Link>
        </div>
      </main>
    </div>
  );
}
