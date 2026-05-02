import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardRowsTable from '@/components/dashboard-rows-table'

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
}

export default async function AdminDashboardPage() {
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
      fecha_fin
    `)
    .order('codigo_of', { ascending: true })
    .order('orden_operacion', { ascending: true })
    .limit(100)

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Panel admin</h1>
          <p className="text-sm text-gray-600">
            {profile.full_name ?? profile.email} — rol: {profile.role}
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="rounded-lg border px-4 py-2">
            Inicio
          </Link>
          <Link href="/dashboard" className="rounded-lg border px-4 py-2">
            Dashboard
          </Link>
          <Link
            href="/dashboard/admin/asignar"
            className="rounded-lg border px-4 py-2"
          >
            Asignar
          </Link>
          <Link
            href="/dashboard/admin/of/nueva"
            className="rounded-lg border px-4 py-2"
          >
            Nueva OF
          </Link>
        </div>
      </div>

      {rowsError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          Error cargando datos: {rowsError.message}
        </div>
      )}

      {!rowsError && (
        <DashboardRowsTable
          rows={(rows as PanelRow[] | null) ?? []}
          titulo="Operaciones cargadas"
          mostrarAsignadoA={true}
          mensajeVacio="No hay datos para mostrar."
        />
      )}
    </main>
  )
}