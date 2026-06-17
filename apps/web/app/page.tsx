export const runtime = "edge";

import Link from "next/link";

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------

function PhoneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 12h6M9 16h4"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: <PhoneIcon />,
    title: "Never miss a call",
    description: "VAI answers every inbound call in under 2 seconds, 24 hours a day, 7 days a week — including holidays. No hold music, no voicemail.",
  },
  {
    icon: <ClipboardIcon />,
    title: "Automatic lead capture",
    description: "Every caller's name, phone number, and reason for calling is logged instantly. Wake up to a full lead sheet every morning.",
  },
  {
    icon: <CalendarIcon />,
    title: "Book appointments",
    description: "Callers can schedule, reschedule, or cancel directly in the conversation. Calendar confirmations sent automatically.",
  },
  {
    icon: <ShieldIcon />,
    title: "Trained for your business",
    description: "Set up your FAQs, hours, and services in minutes. VAI answers exactly like your best receptionist would.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Sign up and pick your niche",
    description: "Choose your business type. We pre-fill your FAQs, hours, and greeting so you're ready in minutes.",
  },
  {
    step: "02",
    title: "Get your AI phone number",
    description: "We provision a local phone number for your business. Forward your existing line or use it directly.",
  },
  {
    step: "03",
    title: "Start taking calls",
    description: "Your AI receptionist is live. Every call answered, every lead captured, every appointment booked — automatically.",
  },
];

const PRICING_FEATURES = [
  "Unlimited inbound calls",
  "Lead capture + full transcripts",
  "Appointment booking & reminders",
  "Custom FAQs and business hours",
  "Dashboard with call log",
  "Email notifications on every call",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">VAI Receptionist</span>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Now in early access
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight text-gray-900">
            Turn every missed call into{" "}
            <span className="text-indigo-600">a booked appointment</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            VAI is an AI phone receptionist that answers calls 24/7, captures leads, and books appointments — so you never lose business to voicemail again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/sign-up" className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Start free trial — no card needed
            </Link>
            <Link href="#how-it-works" className="px-8 py-3.5 border border-gray-200 rounded-xl font-semibold text-base text-gray-700 hover:bg-gray-50 transition-colors">
              See how it works
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-6 pt-6 border-t border-gray-100 w-full">
            {[
              { value: "< 2s", label: "Answer time" },
              { value: "24/7", label: "Always available" },
              { value: "100%", label: "Calls answered" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="bg-gray-900 text-white py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-2xl sm:text-3xl font-semibold leading-snug">
            The average business misses{" "}
            <span className="text-indigo-400">62% of inbound calls.</span>{" "}
            Each missed call is a customer who called your competitor next.
          </p>
          <p className="mt-4 text-gray-400 text-lg">VAI makes sure that never happens to you.</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Everything your front desk does — automated</h2>
          <p className="text-gray-500 text-lg">Set up in minutes. Works from day one.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="group p-7 rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all bg-white">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Up and running in 10 minutes</h2>
            <p className="text-gray-500 text-lg">No technical setup. No developers needed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-indigo-100 -translate-x-6 z-0" />
                )}
                <div className="relative bg-white rounded-2xl border border-gray-200 p-7">
                  <span className="text-3xl font-bold text-indigo-100">{s.step}</span>
                  <h3 className="font-semibold text-lg mt-3 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Simple, predictable pricing</h2>
          <p className="text-gray-500 text-lg">One flat monthly rate. No per-minute charges. No surprises.</p>
        </div>
        <div className="max-w-sm mx-auto">
          <div className="rounded-2xl bg-gray-900 text-white p-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">Pro</span>
              <span className="text-xs font-semibold bg-indigo-500 text-white px-3 py-1 rounded-full">Most popular</span>
            </div>
            <p className="text-5xl font-bold mt-4">
              $49
              <span className="text-lg font-normal text-gray-400">/month</span>
            </p>
            <p className="text-gray-400 text-sm mt-1">per phone number</p>
            <ul className="mt-8 space-y-3">
              {PRICING_FEATURES.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-indigo-400 shrink-0"><CheckIcon /></span>
                  {feat}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="mt-8 block w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold text-center hover:bg-indigo-500 transition-colors"
            >
              Start free trial
            </Link>
            <p className="text-center text-xs text-gray-500 mt-3">No credit card required</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center text-white flex flex-col items-center gap-5">
          <h2 className="text-3xl sm:text-4xl font-bold">Stop losing customers to voicemail</h2>
          <p className="text-indigo-100 text-lg max-w-xl">
            Join businesses that never miss a call. Set up your AI receptionist today — it takes less time than your morning coffee.
          </p>
          <Link
            href="/sign-up"
            className="px-8 py-3.5 bg-white text-indigo-700 rounded-xl font-semibold text-base hover:bg-indigo-50 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-semibold text-gray-700">VAI Receptionist</span>
          <span>Bilingual (English / Spanish) — <em>Coming soon</em></span>
        </div>
      </footer>

    </div>
  );
}
