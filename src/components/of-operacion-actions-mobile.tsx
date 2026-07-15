'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/confirm-dialog'

type ActionType = 'iniciar' | 'suspender' | 'finalizar'

type Props = {
  ofOperacionId: number
  estadoCodigo: number
}

export default function OfOperacionActionsMobile({
  ofOperacionId,
  estadoCodigo,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null)
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const puedeIniciar = estadoCodigo === 2 || estadoCodigo === 5
  const puedeSuspender = estadoCodigo === 3
  const puedeFinalizar = estadoCodigo === 3

  function refreshWithDelay() {
    window.setTimeout(() => {
      router.refresh()
    }, 700)
  }

  async function ejecutarAccion(action: ActionType) {
    setLoadingAction(action)
    setError('')
    setSuccess('')

    let rpcName:
      | 'rpc_iniciar_of_operacion'
      | 'rpc_suspender_of_operacion'
      | 'rpc_finalizar_of_operacion'

    if (action === 'iniciar') {
      rpcName = 'rpc_iniciar_of_operacion'
    } else if (action === 'suspender') {
      rpcName = 'rpc_suspender_of_operacion'
    } else {
      rpcName = 'rpc_finalizar_of_operacion'
    }

    const { error } = await supabase.rpc(rpcName, {
      p_of_operacion_id: ofOperacionId,
    })

    setLoadingAction(null)

    if (error) {
      setError(error.message)
      return
    }

    if (action === 'iniciar') {
      setSuccess('Operación iniciada correctamente.')
    }

    if (action === 'suspender') {
      setSuccess('Operación suspendida correctamente.')
    }

    if (action === 'finalizar') {
      setSuccess('Operación finalizada correctamente.')
    }

    refreshWithDelay()
  }

  function solicitarConfirmacion(action: ActionType) {
    setError('')
    setSuccess('')
    setConfirmAction(action)
  }

  function cerrarConfirmacion() {
    setConfirmAction(null)
  }

  async function confirmarAccion() {
    if (!confirmAction) return

    const action = confirmAction
    setConfirmAction(null)
    await ejecutarAccion(action)
  }

  const confirmTitle =
    confirmAction === 'suspender'
      ? 'Suspender operación'
      : confirmAction === 'finalizar'
        ? 'Finalizar operación'
        : 'Confirmar acción'

  const confirmMessage =
    confirmAction === 'suspender'
      ? '¿Confirmás que querés suspender esta operación? El tiempo acumulado se conservará para continuar más adelante.'
      : confirmAction === 'finalizar'
        ? '¿Confirmás que querés finalizar esta operación? Luego no debería volver a modificarse salvo corrección administrativa.'
        : '¿Confirmás esta acción?'

  const confirmLabel =
    confirmAction === 'suspender'
      ? 'Suspender'
      : confirmAction === 'finalizar'
        ? 'Finalizar'
        : 'Confirmar'

  return (
    <>
      <div className="space-y-3">
        {puedeIniciar && (
          <Button
            type="button"
            variant="outline"
            disabled={loadingAction !== null}
            onClick={() => ejecutarAccion('iniciar')}
            className="min-h-12 w-full rounded-xl border-green-500 bg-green-100 text-base font-bold text-green-950 hover:bg-green-200 hover:text-green-950"
          >
            {loadingAction === 'iniciar' ? 'Iniciando...' : 'Iniciar'}
          </Button>
        )}

        {(puedeSuspender || puedeFinalizar) && (
          <div className="grid grid-cols-2 gap-3">
            {puedeSuspender && (
              <Button
                type="button"
                variant="outline"
                disabled={loadingAction !== null}
                onClick={() => solicitarConfirmacion('suspender')}
                className="min-h-12 rounded-xl border-orange-500 bg-orange-100 text-base font-bold text-orange-950 hover:bg-orange-200 hover:text-orange-950"
              >
                {loadingAction === 'suspender' ? 'Suspendiendo...' : 'Suspender'}
              </Button>
            )}

            {puedeFinalizar && (
              <Button
                type="button"
                variant="outline"
                disabled={loadingAction !== null}
                onClick={() => solicitarConfirmacion('finalizar')}
                className="min-h-12 rounded-xl border-red-500 bg-red-100 text-base font-bold text-red-950 hover:bg-red-200 hover:text-red-950"
              >
                {loadingAction === 'finalizar' ? 'Finalizando...' : 'Finalizar'}
              </Button>
            )}
          </div>
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
        open={confirmAction !== null}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        danger={confirmAction === 'finalizar'}
        onCancel={cerrarConfirmacion}
        onConfirm={confirmarAccion}
      />
    </>
  )
}