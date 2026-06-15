export type FAQ = {
  q: string;
  a: string;
};

export type NicheTemplate = {
  id: string;
  label: string;
  personaName: string;
  personaDescription: string;
  greeting: string; // may contain [Business Name] placeholder
  hours: {
    weekdays: string;
    saturday: string;
  };
  faqs: FAQ[];
};

export const NICHE_TEMPLATES: Record<string, NicheTemplate> = {
  dental: {
    id: "dental",
    label: "Dental Office",
    personaName: "Sarah",
    personaDescription: "professional and warm dental receptionist",
    greeting: "Thank you for calling [Business Name]! This is Sarah. How can I help you today?",
    hours: {
      weekdays: "Monday–Friday 8:00 AM – 5:00 PM",
      saturday: "Saturday 9:00 AM – 2:00 PM",
    },
    faqs: [
      {
        q: "Do you accept insurance?",
        a: "Yes, we accept Delta Dental, Cigna, Aetna, and most major PPOs. We can verify your benefits before your visit.",
      },
      {
        q: "How much does a cleaning cost?",
        a: "A routine cleaning is $120 without insurance. With insurance it is typically $0–30 depending on your plan.",
      },
      {
        q: "Are you accepting new patients?",
        a: "Yes, we are currently accepting new patients. I would be happy to get you scheduled.",
      },
      {
        q: "What happens in a dental emergency?",
        a: "For dental emergencies during office hours, we keep slots open. For after-hours emergencies, please call our emergency line.",
      },
    ],
  },
  home_services: {
    id: "home_services",
    label: "Home Services",
    personaName: "Alex",
    personaDescription: "friendly and professional home services receptionist",
    greeting: "Thank you for calling [Business Name]! This is Alex. How can I help you today?",
    hours: {
      weekdays: "Monday–Friday 7:00 AM – 6:00 PM",
      saturday: "Saturday 8:00 AM – 4:00 PM",
    },
    faqs: [
      {
        q: "What areas do you service?",
        a: "We service the greater metro area within a 30-mile radius. I can confirm your specific location when scheduling.",
      },
      {
        q: "How soon can you come out?",
        a: "We can typically schedule within 24–48 hours for standard jobs. For emergencies, same-day service is often available.",
      },
      {
        q: "Do you provide free estimates?",
        a: "Yes, we offer free estimates for most jobs. We will assess the work needed before any commitment.",
      },
      {
        q: "Are you licensed and insured?",
        a: "Yes, we are fully licensed and carry general liability insurance. We are happy to provide documentation on request.",
      },
    ],
  },
};
