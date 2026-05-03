import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OperarioMobileBoard from '@/components/operario-mobile-board'
import InstallPwaButton from '@/components/install-pwa-button'
import LogoutButton from '@/components/logout-button'

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  role: 'admin' | 'supervisor' | 'operario'
  persona_id: number | null
}

type PanelRow = {
  of_operacion_id: number
  codigo_of: string
  cliente: string
  descripcion_of: string | null
  orden_operacion: number
  codigo_operacion: string
  descripcion_operacion: string
  codigo_variante: string | null
  descripcion_variante: string | null
  tiempo_estimado_horas: number | null
  estado_codigo: number
  estado_nombre: string
  codigo_persona: string | null
  persona_nombre: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  tiempo_acumulado_segundos: number | null
}

export default async function OperarioDashboardPage() {
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

  if (profile.role !== 'operario') {
    redirect('/dashboard')
  }

  const { data: rows, error: rowsError } = await supabase
    .from('v_of_operaciones_panel')
    .select(`
      of_operacion_id,
      codigo_of,
      cliente,
      descripcion_of,
      orden_operacion,
      codigo_operacion,
      descripcion_operacion,
      codigo_variante,
      descripcion_variante,
      tiempo_estimado_horas,
      estado_codigo,
      estado_nombre,
      codigo_persona,
      persona_nombre,
      fecha_inicio,
      fecha_fin,
      tiempo_acumulado_segundos
    `)
    .order('codigo_of', { ascending: true })
    .order('orden_operacion', { ascending: true })
    .limit(100)

  return (
    <main className="p-4 space-y-4 sm:p-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Panel operario</h1>
          <p className="text-sm text-gray-600">
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

  <LogoutButton />
</div>
      </div>

      {rowsError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
          Error cargando datos: {rowsError.message}
        </div>
      )}

      {!rowsError && (
        <OperarioMobileBoard rows={(rows as PanelRow[] | null) ?? []} />
      )}
    </main>
  )
}