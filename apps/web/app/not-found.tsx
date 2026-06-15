export const runtime = "edge";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-8">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500">Page not found.</p>
      <Link href="/" className="text-sm underline hover:no-underline">
        Go home
      </Link>
    </main>
  );
}
