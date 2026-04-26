import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
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
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          No se pudo cargar el perfil del usuario.
        </div>
      </main>
    )
  }

  if (profile.role === 'admin') {
    redirect('/dashboard/admin')
  }

  if (profile.role === 'supervisor') {
    redirect('/dashboard/supervisor')
  }

  if (profile.role === 'operario') {
    redirect('/dashboard/operario')
  }

  return (
    <main className="p-6">
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
        Rol no reconocido.
      </div>
    </main>
  )
}