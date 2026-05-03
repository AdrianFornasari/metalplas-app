'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ConfirmDialog from '@/components/confirm-dialog'

type Props = {
  ofOperacionId: number
  estadoCodigo: number
}

type PendingAction = 'finalizar' | 'suspender' | null

export default function OfOperacionActionsMobile({
  ofOperacionId,
  estadoCodigo,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  function refreshWithDelay() {
    window.setTimeout(() => {
      router.refresh()
    }, 700)
  }

  async function handleIniciar() {
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.rpc('rpc_iniciar_of_operacion', {
      p_of_operacion_id: ofOperacionId,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Operación iniciada.')
    refreshWithDelay()
  }

  async function executeFinalizar() {
    setPendingAction(null)
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.rpc('rpc_finalizar_of_operacion', {
      p_of_operacion_id: ofOperacionId,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Operación finalizada.')
    refreshWithDelay()
  }

  async function executeSuspender() {
    setPendingAction(null)
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.rpc('rpc_suspender_of_operacion', {
      p_of_operacion_id: ofOperacionId,
      p_observaciones: null,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Operación suspendida.')
    refreshWithDelay()
  }

  const puedeIniciar = estadoCodigo === 2 || estadoCodigo === 5
  const puedeFinalizarOSuspender = estadoCodigo === 3

  return (
    <>
      <div className="space-y-3">
        {puedeIniciar && (
          <button
            onClick={handleIniciar}
            disabled={loading}
            className="w-full rounded-xl border border-emerald-700 bg-emerald-600 px-4 py-4 text-base font-semibold text-white active:scale-[0.99]"
          >
            {loading ? 'Procesando...' : 'Iniciar'}
          </button>
        )}

        {puedeFinalizarOSuspender && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPendingAction('suspender')}
              disabled={loading}
              className="w-full rounded-xl border border-yellow-500 bg-yellow-300 px-4 py-4 text-base font-semibold text-gray-900 active:scale-[0.99]"
            >
              {loading ? 'Procesando...' : 'Suspender'}
            </button>

            <button
              onClick={() => setPendingAction('finalizar')}
              disabled={loading}
              className="w-full rounded-xl border border-red-700 bg-red-600 px-4 py-4 text-base font-semibold text-white active:scale-[0.99]"
            >
              {loading ? 'Procesando...' : 'Finalizar'}
            </button>
          </div>
        )}

        {!puedeIniciar && !puedeFinalizarOSuspender && (
          <div className="text-sm text-gray-500">Sin acciones disponibles.</div>
        )}

        {success && (
          <div className="rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingAction === 'finalizar'}
        title="Finalizar operación"
        message="¿Confirmás que querés finalizar esta operación?"
        confirmLabel="Finalizar"
        confirmTone="danger"
        onCancel={() => setPendingAction(null)}
        onConfirm={executeFinalizar}
      />

      <ConfirmDialog
        open={pendingAction === 'suspender'}
        title="Suspender operación"
        message="¿Confirmás que querés suspender esta operación?"
        confirmLabel="Suspender"
        confirmTone="warning"
        onCancel={() => setPendingAction(null)}
        onConfirm={executeSuspender}
      />
    </>
  )
}