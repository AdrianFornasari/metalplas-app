'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import OfOperacionMobileCard from '@/components/of-operacion-mobile-card'
import type { OperarioOption } from '@/components/pending-inline-assignment'

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
  tiempo_acumulado_segundos: number | null
  estado_codigo: number
  estado_nombre: string
  codigo_persona: string | null
  persona_nombre: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
}

type Props = {
  rows: PanelRow[]
  operarios: OperarioOption[]
}

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: '1', label: 'Pendiente' },
  { value: '2', label: 'Asignada' },
  { value: '3', label: 'En curso' },
  { value: '4', label: 'Finalizada' },
  { value: '5', label: 'Suspendida' },
]

export default function SupervisorMobileBoard({ rows, operarios }: Props) {
  const [soloNoFinalizadas, setSoloNoFinalizadas] = useState(true)
  const [filtroOf, setFiltroOf] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const totalNoFinalizadas = useMemo(
    () => rows.filter((row) => row.estado_codigo !== 4).length,
    [rows]
  )

  const totalPendientes = useMemo(
    () => rows.filter((row) => row.estado_codigo === 1).length,
    [rows]
  )

  const filteredRows = useMemo(() => {
    const ofTerm = filtroOf.trim().toLowerCase()
    const clienteTerm = filtroCliente.trim().toLowerCase()

    return rows.filter((row) => {
      if (soloNoFinalizadas && row.estado_codigo === 4) return false

      if (filtroEstado !== 'todos' && row.estado_codigo !== Number(filtroEstado)) {
        return false
      }

      if (ofTerm && !String(row.codigo_of).toLowerCase().includes(ofTerm)) {
        return false
      }

      if (clienteTerm && !row.cliente.toLowerCase().includes(clienteTerm)) {
        return false
      }

      return true
    })
  }, [rows, soloNoFinalizadas, filtroOf, filtroCliente, filtroEstado])

  function limpiarFiltros() {
    setFiltroOf('')
    setFiltroCliente('')
    setFiltroEstado('todos')
    setSoloNoFinalizadas(true)
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-900">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Operaciones visibles
            </h2>
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

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div>
              No finalizadas: <strong>{totalNoFinalizadas}</strong>
            </div>
            <div>
              Pendientes: <strong>{totalPendientes}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                Buscar OF
              </label>
              <input
                type="text"
                value={filtroOf}
                onChange={(e) => setFiltroOf(e.target.value)}
                placeholder="Ej: 12"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                Buscar cliente
              </label>
              <input
                type="text"
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                placeholder="Ej: Metalplas"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => {
                  const value = e.target.value
                  setFiltroEstado(value)

                  if (value === '4') {
                    setSoloNoFinalizadas(false)
                  }
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900"
              >
                {ESTADOS.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/dashboard/supervisor/asignar"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900"
            >
              Ir a asignación
            </Link>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {filteredRows.length === 0 && (
        <div className="rounded-2xl border border-gray-300 bg-white p-6 text-center text-gray-500">
          No hay operaciones visibles con esos filtros.
        </div>
      )}

      <div className="space-y-4">
        {filteredRows.map((row) => (
          <OfOperacionMobileCard
            key={row.of_operacion_id}
            row={row}
            mostrarAsignadoA={true}
            permitirAsignacionInline={true}
            operariosAsignables={operarios}
          />
        ))}
      </div>
    </section>
  )
}