import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AsignacionPendientesTable from '@/components/asignacion-pendientes-table'

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  role: 'admin' | 'supervisor' | 'operario'
  persona_id: number | null
}

type PendingRow = {
  of_operacion_id: number
  codigo_of: string
  cliente: string
  orden_operacion: number
  codigo_operacion: string
  descripcion_operacion: string
  codigo_variante: string | null
  descripcion_variante: string | null
  estado_nombre: string
  persona_nombre: string | null
}

type PersonaOption = {
  id: number
  codigo_persona: string
  nombre: string
  funcion: string | null
}

type OperarioProfile = {
  persona_id: number | null
}

export default async function SupervisorAsignarPage() {
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
      orden_operacion,
      codigo_operacion,
      descripcion_operacion,
      codigo_variante,
      descripcion_variante,
      estado_nombre,
      persona_nombre
    `)
    .eq('estado_codigo', 1)
    .order('codigo_of', { ascending: true })
    .order('orden_operacion', { ascending: true })

  const { data: operarioProfiles, error: operariosError } = await supabase
    .from('profiles')
    .select('persona_id')
    .eq('role', 'operario')
    .eq('activo', true)

  let personas: PersonaOption[] | null = []
  let personasError: { message: string } | null = null

  if (!operariosError) {
    const personaIds = ((operarioProfiles as OperarioProfile[] | null) ?? [])
      .map((p) => p.persona_id)
      .filter((id): id is number => id !== null)

    if (personaIds.length > 0) {
      const result = await supabase
        .from('personas')
        .select('id, codigo_persona, nombre, funcion')
        .in('id', personaIds)
        .eq('activo', true)
        .order('nombre', { ascending: true })

      personas = (result.data as PersonaOption[] | null) ?? []
      personasError = result.error ? { message: result.error.message } : null
    } else {
      personas = []
    }
  }

  return (
    <main className="p-4 space-y-4 sm:p-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Asignación de operaciones</h1>
          <p className="text-sm text-gray-600">
            {profile.full_name ?? profile.email} — rol: {profile.role}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/supervisor"
            className="rounded-xl border px-4 py-3"
          >
            Volver al panel
          </Link>
          <Link href="/" className="rounded-xl border px-4 py-3">
            Inicio
          </Link>
        </div>
      </div>

      {rowsError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
          Error cargando pendientes: {rowsError.message}
        </div>
      )}

      {operariosError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
          Error cargando perfiles de operarios: {operariosError.message}
        </div>
      )}

      {personasError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
          Error cargando operarios: {personasError.message}
        </div>
      )}

      {!rowsError && !operariosError && !personasError && (
        <AsignacionPendientesTable
          rows={(rows as PendingRow[] | null) ?? []}
          personas={personas ?? []}
          titulo="Operaciones pendientes"
        />
      )}
    </main>
  )
}