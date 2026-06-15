export const runtime = "edge";

import { auth } from "@clerk/nextjs/server";

const STATS = [
  { label: "Total Calls", value: "—" },
  { label: "Leads Captured", value: "—" },
  { label: "Appointments Booked", value: "—" },
];

export default async function DashboardPage() {
  const { userId } = await auth();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-8">Welcome back, {userId}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-400 text-center">
        Call log, transcripts, and appointments will appear here — coming in Phase 5.
      </p>
    </div>
  );
}
