import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NuevaOfForm from '@/components/nueva-of-form'
import LogoutButton from '@/components/logout-button'

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  role: 'admin' | 'supervisor' | 'operario'
  persona_id: number | null
}

type Operacion = {
  id: number
  codigo: string
  descripcion: string
}

type Variante = {
  id: number
  operacion_id: number
  codigo: string
  descripcion: string
  tiempo_estimado_horas: number | null
}

export default async function NuevaOfAdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, persona_id')
    .eq('id', user.id)
    .single<Profile>()

  if (profileError || !profile) {
    redirect('/login')
  }

  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: operaciones, error: operacionesError } = await supabase
    .from('operaciones')
    .select('id, codigo, descripcion')
    .eq('activo', true)
    .order('codigo', { ascending: true })

  const { data: variantes, error: variantesError } = await supabase
    .from('variantes_operacion')
    .select('id, operacion_id, codigo, descripcion, tiempo_estimado_horas')
    .eq('activo', true)
    .order('operacion_id', { ascending: true })
    .order('codigo', { ascending: true })

  return (
    <main className="p-4 space-y-4 sm:p-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-300 bg-white p-4 text-gray-900">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Nueva orden de fabricación
          </h1>
          <p className="text-sm text-gray-700">
            {profile.full_name ?? profile.email}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
          >
            Inicio
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
          >
            Volver al panel
          </Link>

          <LogoutButton />
        </div>
      </div>

      {operacionesError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
          Error cargando operaciones: {operacionesError.message}
        </div>
      )}

      {variantesError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
          Error cargando variantes: {variantesError.message}
        </div>
      )}

      {!operacionesError && !variantesError && (
        <NuevaOfForm
          rolePath="admin"
          operaciones={(operaciones as Operacion[] | null) ?? []}
          variantes={(variantes as Variante[] | null) ?? []}
        />
      )}
    </main>
  )
}