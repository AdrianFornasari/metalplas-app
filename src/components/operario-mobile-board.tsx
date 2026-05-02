'use client'

import { useMemo, useState } from 'react'
import OfOperacionMobileCard from '@/components/of-operacion-mobile-card'

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

type Props = {
  rows: PanelRow[]
}

export default function OperarioMobileBoard({ rows }: Props) {
  const [soloNoFinalizadas, setSoloNoFinalizadas] = useState(true)

  const filteredRows = useMemo(() => {
    if (!soloNoFinalizadas) return rows
    return rows.filter((row) => row.estado_codigo !== 4)
  }, [rows, soloNoFinalizadas])

  const totalNoFinalizadas = useMemo(
    () => rows.filter((row) => row.estado_codigo !== 4).length,
    [rows]
  )

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-900">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Mis tareas</h2>
            <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700">
              {filteredRows.length} visibles
            </span>
          </div>

          <label className="flex items-center gap-3 text-sm text-gray-900">
            <input
              type="checkbox"
              checked={soloNoFinalizadas}
              onChange={(e) => setSoloNoFinalizadas(e.target.checked)}
              className="h-5 w-5"
            />
            <span>Sólo no finalizadas</span>
          </label>

          <div className="text-sm text-gray-700">
            No finalizadas: <strong>{totalNoFinalizadas}</strong>
          </div>
        </div>
      </div>

      {filteredRows.length === 0 && (
        <div className="rounded-2xl border border-gray-300 bg-white p-6 text-center text-gray-500">
          No hay tareas visibles para este usuario.
        </div>
      )}

      <div className="space-y-4">
        {filteredRows.map((row) => (
          <OfOperacionMobileCard key={row.of_operacion_id} row={row} />
        ))}
      </div>
    </section>
  )
}