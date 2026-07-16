import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import SupervisorMobileBoard from '@/components/supervisor-mobile-board'
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
  tiempo_acumulado_segundos: number | null
  estado_codigo: number
  estado_nombre: string
  codigo_persona: string | null
  persona_nombre: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
}

type OperarioOption = {
  id: number
  codigo_persona: string
  nombre: string
}

type OperarioProfile = {
  persona_id: number | null
}

export default async function SupervisorDashboardPage() {
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
      tiempo_acumulado_segundos,
      estado_codigo,
      estado_nombre,
      codigo_persona,
      persona_nombre,
      fecha_inicio,
      fecha_fin
    `)
    .order('codigo_of', { ascending: true })
    .order('orden_operacion', { ascending: true })
    .limit(100)

  const { data: operarioProfiles } = await supabase
    .from('profiles')
    .select('persona_id')
    .eq('role', 'operario')
    .eq('activo', true)

  let operarios: OperarioOption[] = []

  const personaIds = ((operarioProfiles as OperarioProfile[] | null) ?? [])
    .map((p) => p.persona_id)
    .filter((id): id is number => id !== null)

  if (personaIds.length > 0) {
    const { data } = await supabase
      .from('personas')
      .select('id, codigo_persona, nombre')
      .in('id', personaIds)
      .eq('activo', true)
      .order('nombre', { ascending: true })

    operarios = (data as OperarioOption[] | null) ?? []
  }

  return (
    <main className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-300 bg-white p-4 text-gray-900">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Panel supervisor
          </h1>
          <p className="text-sm text-gray-700">
            {profile.full_name ?? profile.email}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            variant="outline"
            className="min-h-11 rounded-xl border-gray-300 bg-white px-4 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900"
          >
            <Link href="/">Inicio</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="min-h-11 rounded-xl border-gray-300 bg-white px-4 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900"
          >
            <Link href="/dashboard">Dashboard</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="hidden min-h-11 rounded-xl border-gray-300 bg-white px-4 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900 lg:inline-flex"
          >
            <Link href="/dashboard/supervisor/asignar">Asignar</Link>
          </Button>

          <LogoutButton />
        </div>
      </div>

      {rowsError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
          Error cargando datos: {rowsError.message}
        </div>
      )}

      {!rowsError && (
        <SupervisorMobileBoard
          rows={(rows as PanelRow[] | null) ?? []}
          operarios={operarios}
        />
      )}
    </main>
  )
}