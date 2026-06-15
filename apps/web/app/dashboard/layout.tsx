export const runtime = "edge";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/calls", label: "Calls" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col py-6 px-3 gap-1">
        <span className="px-3 mb-4 text-sm font-bold tracking-tight">VAI Receptionist</span>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </aside>

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 shrink-0 border-b border-gray-200 flex items-center justify-end px-6">
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
