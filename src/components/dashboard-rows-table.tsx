'use client'

import { useMemo, useState } from 'react'
import OfOperacionActions from '@/components/of-operacion-actions'

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

type Props = {
  rows: PanelRow[]
  titulo: string
  mostrarAsignadoA: boolean
  mensajeVacio: string
}

export default function DashboardRowsTable({
  rows,
  titulo,
  mostrarAsignadoA,
  mensajeVacio,
}: Props) {
  const [soloNoFinalizadas, setSoloNoFinalizadas] = useState(true)

  const filteredRows = useMemo(() => {
    if (!soloNoFinalizadas) return rows
    return rows.filter((row) => row.estado_codigo !== 4)
  }, [rows, soloNoFinalizadas])

  const colSpan = mostrarAsignadoA ? 10 : 9

  return (
    <section className="rounded-2xl border p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold">{titulo}</h2>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={soloNoFinalizadas}
            onChange={(e) => setSoloNoFinalizadas(e.target.checked)}
          />
          Sólo no finalizadas
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">OF</th>
              <th className="text-left py-2 pr-4">Cliente</th>
              <th className="text-left py-2 pr-4">Orden</th>
              <th className="text-left py-2 pr-4">Operación</th>
              <th className="text-left py-2 pr-4">Variante</th>
              <th className="text-left py-2 pr-4">Estado</th>
              {mostrarAsignadoA && (
                <th className="text-left py-2 pr-4">Asignado a</th>
              )}
              <th className="text-left py-2 pr-4">Inicio</th>
              <th className="text-left py-2 pr-4">Fin</th>
              <th className="text-left py-2 pr-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.of_operacion_id} className="border-b align-top">
                <td className="py-2 pr-4">{row.codigo_of}</td>
                <td className="py-2 pr-4">{row.cliente}</td>
                <td className="py-2 pr-4">{row.orden_operacion}</td>
                <td className="py-2 pr-4">
                  {row.codigo_operacion} - {row.descripcion_operacion}
                </td>
                <td className="py-2 pr-4">
                  {row.codigo_variante
                    ? `${row.codigo_variante} - ${row.descripcion_variante ?? ''}`
                    : '-'}
                </td>
                <td className="py-2 pr-4">{row.estado_nombre}</td>

                {mostrarAsignadoA && (
                  <td className="py-2 pr-4">{row.persona_nombre ?? '-'}</td>
                )}

                <td className="py-2 pr-4">{row.fecha_inicio ?? '-'}</td>
                <td className="py-2 pr-4">{row.fecha_fin ?? '-'}</td>
                <td className="py-2 pr-4">
                  <OfOperacionActions
                    ofOperacionId={row.of_operacion_id}
                    estadoCodigo={row.estado_codigo}
                  />
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="py-4 text-center text-gray-500">
                  {mensajeVacio}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}