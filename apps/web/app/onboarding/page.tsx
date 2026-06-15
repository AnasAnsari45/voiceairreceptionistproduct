"use client";

import { useState } from "react";
import { NICHE_TEMPLATES, type FAQ } from "@/lib/tenant-templates";

type Step = 1 | 2 | 3 | 4;

type BusinessDetails = {
  name: string;
  phone: string;
  address: string;
  hoursWeekdays: string;
  hoursSaturday: string;
};

type PersonaDetails = {
  personaName: string;
  greeting: string;
};

const STEP_LABELS: Record<Step, string> = {
  1: "Business type",
  2: "Business details",
  3: "FAQs",
  4: "Voice persona",
};

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedNiche, setSelectedNiche] = useState("");
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    name: "",
    phone: "",
    address: "",
    hoursWeekdays: "",
    hoursSaturday: "",
  });
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [persona, setPersona] = useState<PersonaDetails>({
    personaName: "",
    greeting: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function pickNiche(nicheId: string) {
    const t = NICHE_TEMPLATES[nicheId];
    setSelectedNiche(nicheId);
    setFaqs(t.faqs.map((f) => ({ ...f })));
    setBusinessDetails((prev) => ({
      ...prev,
      hoursWeekdays: t.hours.weekdays,
      hoursSaturday: t.hours.saturday,
    }));
    setPersona({
      personaName: t.personaName,
      greeting: t.greeting,
    });
  }

  function setFaqField(index: number, field: "q" | "a", value: string) {
    setFaqs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addFaq() {
    setFaqs((prev) => [...prev, { q: "", a: "" }]);
  }

  function removeFaq(index: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: selectedNiche,
          ...businessDetails,
          faqs,
          ...persona,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      // Hard redirect so Clerk fetches a fresh token with onboardingComplete = true
      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const canAdvance: Record<Step, boolean> = {
    1: !!selectedNiche,
    2: !!businessDetails.name.trim() && !!businessDetails.phone.trim(),
    3: faqs.length > 0 && faqs.every((f) => f.q.trim() && f.a.trim()),
    4: !!persona.personaName.trim() && !!persona.greeting.trim(),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Progress */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center gap-2">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  s < step
                    ? "bg-black text-white"
                    : s === step
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s < step ? "+" : s}
              </div>
              {s < 4 && (
                <div
                  className={`h-0.5 flex-1 ${s < step ? "bg-black" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Step {step} of 4 — {STEP_LABELS[step]}
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-8">
        {step === 1 && (
          <StepNiche selected={selectedNiche} onSelect={pickNiche} />
        )}
        {step === 2 && (
          <StepDetails
            values={businessDetails}
            onChange={(field, value) =>
              setBusinessDetails((prev) => ({ ...prev, [field]: value }))
            }
          />
        )}
        {step === 3 && (
          <StepFaqs
            faqs={faqs}
            onChange={setFaqField}
            onAdd={addFaq}
            onRemove={removeFaq}
          />
        )}
        {step === 4 && (
          <StepPersona
            values={persona}
            businessName={businessDetails.name}
            onChange={(field, value) =>
              setPersona((prev) => ({ ...prev, [field]: value }))
            }
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance[step]}
              className="flex-1 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canAdvance[4] || submitting}
              className="flex-1 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Finish setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step sub-components
// ---------------------------------------------------------------------------

function StepNiche({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">What kind of business are you?</h2>
      <p className="text-sm text-gray-500 mb-6">
        We will pre-fill your FAQs and hours based on your niche.
      </p>
      <div className="flex flex-col gap-3">
        {Object.values(NICHE_TEMPLATES).map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-colors ${
              selected === t.id
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <p className="font-medium text-sm">{t.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDetails({
  values,
  onChange,
}: {
  values: BusinessDetails;
  onChange: (field: keyof BusinessDetails, value: string) => void;
}) {
  const fields: { key: keyof BusinessDetails; label: string; placeholder: string; required?: boolean }[] = [
    { key: "name", label: "Business name", placeholder: "Bright Smile Dental", required: true },
    { key: "phone", label: "Business phone", placeholder: "+1 555 123 4567", required: true },
    { key: "address", label: "Address", placeholder: "123 Main St, Springfield, IL" },
    { key: "hoursWeekdays", label: "Weekday hours", placeholder: "Monday–Friday 8:00 AM – 5:00 PM" },
    { key: "hoursSaturday", label: "Saturday hours", placeholder: "Saturday 9:00 AM – 2:00 PM" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Tell us about your business</h2>
      <p className="text-sm text-gray-500 mb-6">
        Your AI receptionist will use these details when answering callers.
      </p>
      <div className="flex flex-col gap-4">
        {fields.map(({ key, label, placeholder, required }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={values[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepFaqs({
  faqs,
  onChange,
  onAdd,
  onRemove,
}: {
  faqs: FAQ[];
  onChange: (index: number, field: "q" | "a", value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Review your FAQs</h2>
      <p className="text-sm text-gray-500 mb-6">
        These are pre-filled for your niche. Edit, remove, or add any you like.
      </p>
      <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
        {faqs.map((faq, i) => (
          <div key={i} className="relative border border-gray-200 rounded-xl p-4">
            <button
              onClick={() => onRemove(i)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-lg leading-none"
              aria-label="Remove FAQ"
            >
              x
            </button>
            <div className="flex flex-col gap-2 pr-4">
              <input
                type="text"
                value={faq.q}
                onChange={(e) => onChange(i, "q", e.target.value)}
                placeholder="Question"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <textarea
                value={faq.a}
                onChange={(e) => onChange(i, "a", e.target.value)}
                placeholder="Answer"
                rows={2}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-4 w-full py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-gray-500 hover:text-gray-700 transition-colors"
      >
        + Add FAQ
      </button>
    </div>
  );
}

function StepPersona({
  values,
  businessName,
  onChange,
}: {
  values: PersonaDetails;
  businessName: string;
  onChange: (field: keyof PersonaDetails, value: string) => void;
}) {
  const resolvedGreeting = values.greeting.replace(
    "[Business Name]",
    businessName || "your business"
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Set up your AI receptionist</h2>
      <p className="text-sm text-gray-500 mb-6">
        Give your receptionist a name and a greeting phrase.
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Receptionist name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.personaName}
            onChange={(e) => onChange("personaName", e.target.value)}
            placeholder="Sarah"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Opening greeting <span className="text-red-500">*</span>
          </label>
          <textarea
            value={values.greeting}
            onChange={(e) => onChange("greeting", e.target.value)}
            rows={3}
            placeholder="Thank you for calling [Business Name]! This is Sarah. How can I help you today?"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
        </div>
        {resolvedGreeting && (
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Preview</p>
            <p className="text-sm text-gray-700 italic">&ldquo;{resolvedGreeting}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
