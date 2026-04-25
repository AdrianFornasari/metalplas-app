import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="space-y-4 rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Metalplas App</h1>

        <div className="flex gap-3">
          <Link href="/login" className="rounded-lg border px-4 py-2">
            Ir a login
          </Link>

          <Link href="/dashboard" className="rounded-lg border px-4 py-2">
            Ir a dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}