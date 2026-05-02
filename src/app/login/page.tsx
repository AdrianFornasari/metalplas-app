import { login } from './actions'

type SearchParams = Promise<{
  error?: string
}>

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const error = searchParams.error

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            formAction={login}
            className="w-full rounded-lg border px-4 py-2"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  )
}