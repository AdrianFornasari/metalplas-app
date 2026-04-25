'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AltaPruebaPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMensaje('')
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    setMensaje(
      `Usuario creado. ID devuelto por Supabase: ${data.user?.id ?? 'sin id visible'}`
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Alta de usuario de prueba</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mensaje && <div className="text-sm text-green-700">{mensaje}</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          <button type="submit" className="w-full rounded-lg border px-4 py-2">
            Crear usuario
          </button>
        </form>
      </div>
    </main>
  )
}