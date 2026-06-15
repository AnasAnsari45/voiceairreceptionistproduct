// Shared TypeScript types — used by apps/web.
// The Python voice agent uses equivalent dataclasses in config.py.

export interface Tenant {
  id: string;
  clerkUserId?: string | null;
  name: string;
  timezone: string;
  plan: string;
  nicheTemplate?: string | null;
  calcomEventTypeId?: string | null;
  addCallerAsGuest: boolean;
}

export interface PhoneNumber {
  id: string;
  tenantId: string;
  e164: string;
  provider: string;
  active: boolean;
}

export interface KnowledgeItem {
  id: string;
  tenantId: string;
  type: "faq" | "service" | "policy" | "hours";
  title: string;
  content: string;
  price?: string | null;
  sortOrder: number;
}

export interface Customer {
  id: string;
  tenantId: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  notes?: string | null;
  createdAt: Date;
}

export interface Call {
  id: string;
  tenantId: string;
  customerId?: string | null;
  startedAt: Date;
  endedAt?: Date | null;
  durationSec?: number | null;
  transcript?: string | null;
  summary?: string | null;
  intent?: string | null;
  outcome?: string | null;
}

export type AppointmentStatus = "booked" | "rescheduled" | "cancelled";

export interface Appointment {
  id: string;
  tenantId: string;
  customerId?: string | null;
  callId?: string | null;
  calendarEventId?: string | null;
  type?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  status: AppointmentStatus;
  ownerNotified: boolean;
  createdAt: Date;
}
