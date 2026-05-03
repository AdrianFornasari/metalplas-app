'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmDialog from '@/components/confirm-dialog'

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

type Props = {
  rows: PendingRow[]
  personas: PersonaOption[]
  titulo: string
}

type PendingConfirm = {
  ofOperacionId: number
  personaNombre: string
} | null

export default function AsignacionPendientesTable({
  rows,
  personas,
  titulo,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [seleccion, setSeleccion] = useState<Record<number, string>>({})
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [errorGlobal, setErrorGlobal] = useState('')
  const [successGlobal, setSuccessGlobal] = useState('')
  const [soloPendientes, setSoloPendientes] = useState(true)
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null)

  const personasOptions = useMemo(() => personas ?? [], [personas])

  const filteredRows = useMemo(() => {
    if (!soloPendientes) return rows
    return rows
  }, [rows, soloPendientes])

  function refreshWithDelay() {
    window.setTimeout(() => {
      router.refresh()
    }, 700)
  }

  function askAsignar(ofOperacionId: number, personaNombre: string | undefined) {
    const personaId = seleccion[ofOperacionId]

    if (!personaId) {
      setErrorGlobal('Elegí un operario antes de asignar.')
      setSuccessGlobal('')
      return
    }

    setPendingConfirm({
      ofOperacionId,
      personaNombre: personaNombre ?? 'este operario',
    })
  }

  async function executeAsignar() {
    if (!pendingConfirm) return

    const ofOperacionId = pendingConfirm.ofOperacionId
    const personaId = seleccion[ofOperacionId]

    if (!personaId) {
      setPendingConfirm(null)
      setErrorGlobal('Elegí un operario antes de asignar.')
      setSuccessGlobal('')
      return
    }

    setPendingConfirm(null)
    setErrorGlobal('')
    setSuccessGlobal('')
    setLoadingId(ofOperacionId)

    const { error } = await supabase.rpc('rpc_asignar_of_operacion', {
      p_of_operacion_id: ofOperacionId,
      p_persona_id: Number(personaId),
    })

    setLoadingId(null)

    if (error) {
      setErrorGlobal(error.message)
      return
    }

    setSuccessGlobal('Operario asignado correctamente.')
    refreshWithDelay()
  }

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-900 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
              <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700">
                {filteredRows.length} visibles
              </span>
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={soloPendientes}
                onChange={(e) => setSoloPendientes(e.target.checked)}
                className="h-5 w-5"
              />
              <span>Mostrar pendientes</span>
            </label>

            <div className="text-sm text-gray-700">
              Operarios disponibles: <strong>{personasOptions.length}</strong>
            </div>
          </div>
        </div>

        {successGlobal && (
          <div className="rounded-2xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {successGlobal}
          </div>
        )}

        {errorGlobal && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {errorGlobal}
          </div>
        )}

        {filteredRows.length === 0 && (
          <div className="rounded-2xl border border-gray-300 bg-white p-6 text-center text-gray-500">
            No hay operaciones pendientes para asignar.
          </div>
        )}

        <div className="space-y-4">
          {filteredRows.map((row) => {
            const personaSeleccionada = personasOptions.find(
              (p) => String(p.id) === (seleccion[row.of_operacion_id] ?? '')
            )

            return (
              <article
                key={row.of_operacion_id}
                className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-900 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base text-gray-700">
                      OF: <span className="font-semibold text-gray-900">{row.codigo_of}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      Cliente: <span className="font-medium text-gray-900">{row.cliente}</span>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                    {row.estado_nombre}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="text-sm text-gray-700">
                    Operación número{' '}
                    <span className="font-bold text-gray-900">{row.orden_operacion}</span>
                  </div>

                  <div className="text-base font-medium text-gray-900">
                    {row.codigo_operacion} - {row.descripcion_operacion}
                  </div>

                  <div className="text-sm text-gray-700">
                    Variante:{' '}
                    <span className="text-gray-900">
                      {row.codigo_variante
                        ? `${row.codigo_variante} - ${row.descripcion_variante ?? ''}`
                        : 'Sin variante'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700">
                    Asignado a:{' '}
                    <span className="text-gray-900">{row.persona_nombre ?? 'Sin asignar'}</span>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-900">
                      Elegir operario
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 shadow-sm"
                      value={seleccion[row.of_operacion_id] ?? ''}
                      onChange={(e) =>
                        setSeleccion((prev) => ({
                          ...prev,
                          [row.of_operacion_id]: e.target.value,
                        }))
                      }
                    >
                      <option value="" className="bg-white text-gray-900">
                        Seleccionar...
                      </option>
                      {personasOptions.map((persona) => (
                        <option
                          key={persona.id}
                          value={persona.id}
                          className="bg-white text-gray-900"
                        >
                          {persona.nombre} ({persona.codigo_persona})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() =>
                      askAsignar(row.of_operacion_id, personaSeleccionada?.nombre)
                    }
                    disabled={loadingId === row.of_operacion_id}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-900 active:scale-[0.99]"
                  >
                    {loadingId === row.of_operacion_id
                      ? 'Asignando...'
                      : 'Asignar operario'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <ConfirmDialog
        open={pendingConfirm !== null}
        title="Asignar operario"
        message={
          pendingConfirm
            ? `¿Confirmás asignar esta operación a ${pendingConfirm.personaNombre}?`
            : ''
        }
        confirmLabel="Asignar"
        onCancel={() => setPendingConfirm(null)}
        onConfirm={executeAsignar}
      />
    </>
  )
}