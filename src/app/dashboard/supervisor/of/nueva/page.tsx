import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NuevaOfForm from '@/components/nueva-of-form'

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

export default async function NuevaOfSupervisorPage() {
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

  if (profile.role !== 'supervisor') {
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
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Nueva OF</h1>
          <p className="text-sm text-gray-600">
            {profile.full_name ?? profile.email} — rol: {profile.role}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/supervisor"
            className="rounded-lg border px-4 py-2"
          >
            Volver al panel
          </Link>
          <Link href="/" className="rounded-lg border px-4 py-2">
            Inicio
          </Link>
        </div>
      </div>

      {operacionesError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          Error cargando operaciones: {operacionesError.message}
        </div>
      )}

      {variantesError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          Error cargando variantes: {variantesError.message}
        </div>
      )}

      {!operacionesError && !variantesError && (
        <NuevaOfForm
          rolePath="supervisor"
          operaciones={(operaciones as Operacion[] | null) ?? []}
          variantes={(variantes as Variante[] | null) ?? []}
        />
      )}
    </main>
  )
}