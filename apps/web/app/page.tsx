export const runtime = "edge";

import Link from "next/link";

const FEATURES = [
  {
    label: "Never miss a call",
    description:
      "VAI answers every inbound call instantly, 24 hours a day. Callers get a natural conversation — not voicemail.",
  },
  {
    label: "Capture every lead",
    description:
      "Name, phone number, and reason for calling are logged automatically on every call. No manual data entry.",
  },
  {
    label: "Book appointments",
    description:
      "Callers can schedule, reschedule, or cancel directly with the AI. Calendar confirmations sent automatically.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <span className="font-bold text-lg tracking-tight">VAI Receptionist</span>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-8 py-24 gap-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Now in early access
        </span>
        <h1 className="text-5xl font-bold tracking-tight max-w-2xl leading-tight">
          Your business phone, answered 24/7 by AI
        </h1>
        <p className="text-xl text-gray-500 max-w-xl leading-relaxed">
          VAI picks up every call, captures lead info, and books appointments —
          even at 2 AM. No extra staff needed.
        </p>
        <div className="flex gap-3 mt-2">
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Start free trial
          </Link>
          <Link
            href="#features"
            className="px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            See how it works
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <span className="inline-block w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center mb-4">
                {i + 1}
              </span>
              <h3 className="font-semibold text-lg mb-2">{f.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-8 py-20 flex flex-col items-center gap-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-3">Simple pricing</h2>
          <p className="text-gray-500">One flat monthly rate. No per-minute charges.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 p-8 w-full max-w-xs">
          <p className="font-semibold text-lg">Pro</p>
          <p className="text-5xl font-bold mt-2">
            $49
            <span className="text-lg font-normal text-gray-500">/mo</span>
          </p>
          <ul className="text-sm text-gray-600 mt-6 space-y-2">
            {[
              "Unlimited inbound calls",
              "Lead capture + transcripts",
              "Appointment booking",
              "Dashboard and call log",
              "Custom business knowledge",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-black font-bold text-xs">+</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/sign-up"
            className="mt-6 block w-full py-3 bg-black text-white rounded-lg text-sm font-medium text-center hover:bg-gray-800 transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 px-8 py-6 text-center text-xs text-gray-400">
        Bilingual (English / Spanish) — <em>Coming soon</em>
      </footer>
    </div>
  );
}
