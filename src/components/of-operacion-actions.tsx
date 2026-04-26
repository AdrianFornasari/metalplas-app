'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  ofOperacionId: number
  estadoCodigo: number
}

export default function OfOperacionActions({
  ofOperacionId,
  estadoCodigo,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleIniciar() {
    setLoading(true)
    setError('')

    const { error } = await supabase.rpc('rpc_iniciar_of_operacion', {
      p_of_operacion_id: ofOperacionId,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.refresh()
  }

  async function handleFinalizar() {
    setLoading(true)
    setError('')

    const { error } = await supabase.rpc('rpc_finalizar_of_operacion', {
      p_of_operacion_id: ofOperacionId,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(estadoCodigo === 2 || estadoCodigo === 5) && (
          <button
            onClick={handleIniciar}
            disabled={loading}
            className="rounded-lg border px-3 py-1"
          >
            {loading ? 'Procesando...' : 'Iniciar'}
          </button>
        )}

        {estadoCodigo === 3 && (
          <button
            onClick={handleFinalizar}
            disabled={loading}
            className="rounded-lg border px-3 py-1"
          >
            {loading ? 'Procesando...' : 'Finalizar'}
          </button>
        )}
      </div>

      {error && (
        <div className="max-w-xs text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}