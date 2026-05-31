'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmDialog from '@/components/confirm-dialog'

export type OperarioOption = {
  id: number
  codigo_persona: string
  nombre: string
}

type Props = {
  ofOperacionId: number
  operarios: OperarioOption[]
}

export default function PendingInlineAssignment({
  ofOperacionId,
  operarios,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [abierto, setAbierto] = useState(false)
  const [operarioId, setOperarioId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const operarioSeleccionado = useMemo(
    () => operarios.find((o) => String(o.id) === operarioId),
    [operarios, operarioId]
  )

  function refreshWithDelay() {
    window.setTimeout(() => {
      router.refresh()
    }, 700)
  }

  function handleAbrir() {
    setError('')
    setSuccess('')
    setAbierto(true)
  }

  function handleCancelar() {
    setAbierto(false)
    setOperarioId('')
    setError('')
    setSuccess('')
  }

  function handleSolicitarConfirmacion() {
    if (!operarioId) {
      setError('Elegí un operario antes de asignar.')
      setSuccess('')
      return
    }

    setConfirmOpen(true)
  }

  async function handleConfirmar() {
    if (!operarioId) {
      setConfirmOpen(false)
      setError('Elegí un operario antes de asignar.')
      return
    }

    setConfirmOpen(false)
    setLoading(true)
    setError('')
    setSuccess('')

    const { error } = await supabase.rpc('rpc_asignar_of_operacion', {
      p_of_operacion_id: ofOperacionId,
      p_persona_id: Number(operarioId),
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Operario asignado correctamente.')
    setAbierto(false)
    refreshWithDelay()
  }

  return (
    <>
      <div className="mt-4 border-t border-gray-200 pt-4">
        {!abierto && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAbrir}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-bold text-gray-900"
            >
              Asignar
            </button>
          </div>
        )}

        {abierto && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                Elegir operario
              </label>
              <select
                value={operarioId}
                onChange={(e) => setOperarioId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900"
                disabled={loading}
              >
                <option value="">Seleccionar...</option>
                {operarios.map((operario) => (
                  <option key={operario.id} value={operario.id}>
                    {operario.nombre} ({operario.codigo_persona})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancelar}
                disabled={loading}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSolicitarConfirmacion}
                disabled={loading}
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-bold text-gray-900"
              >
                {loading ? 'Asignando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-3 rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Asignar operario"
        message={
          operarioSeleccionado
            ? `¿Confirmás asignar esta operación a ${operarioSeleccionado.nombre}?`
            : '¿Confirmás la asignación?'
        }
        confirmLabel="Asignar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmar}
      />
    </>
  )
}