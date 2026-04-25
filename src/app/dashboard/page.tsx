'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  role: 'admin' | 'supervisor' | 'operario'
  persona_id: number | null
}

type EstadoOperacion = {
  codigo: number
  nombre: string
  es_terminal: boolean
  orden_visual: number
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [estados, setEstados] = useState<EstadoOperacion[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      setEmail(user.email ?? '')

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, persona_id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setError(`Error cargando profile: ${profileError.message}`)
        setLoading(false)
        return
      }

      setProfile(profileData)

      const { data: estadosData, error: estadosError } = await supabase
        .from('estados_operacion')
        .select('codigo, nombre, es_terminal, orden_visual')
        .order('orden_visual', { ascending: true })

      if (estadosError) {
        setError(`Error cargando estados: ${estadosError.message}`)
        setLoading(false)
        return
      }

      setEstados(estadosData ?? [])
      setLoading(false)
    }

    load()
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return <main className="p-6">Cargando...</main>
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">Usuario autenticado: {email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border px-4 py-2"
        >
          Cerrar sesión
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {profile && (
        <section className="rounded-2xl border p-4">
          <h2 className="text-lg font-semibold mb-3">Mi profile</h2>
          <div className="space-y-1 text-sm">
            <div><strong>ID:</strong> {profile.id}</div>
            <div><strong>Email:</strong> {profile.email ?? '-'}</div>
            <div><strong>Nombre:</strong> {profile.full_name ?? '-'}</div>
            <div><strong>Rol:</strong> {profile.role}</div>
            <div><strong>Persona ID:</strong> {profile.persona_id ?? '-'}</div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold mb-3">Estados de operación</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Código</th>
                <th className="text-left py-2 pr-4">Nombre</th>
                <th className="text-left py-2 pr-4">Terminal</th>
                <th className="text-left py-2 pr-4">Orden</th>
              </tr>
            </thead>
            <tbody>
              {estados.map((e) => (
                <tr key={e.codigo} className="border-b">
                  <td className="py-2 pr-4">{e.codigo}</td>
                  <td className="py-2 pr-4">{e.nombre}</td>
                  <td className="py-2 pr-4">{e.es_terminal ? 'Sí' : 'No'}</td>
                  <td className="py-2 pr-4">{e.orden_visual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}