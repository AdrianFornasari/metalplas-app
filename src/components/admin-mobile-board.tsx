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

const PRIORIDAD_ESTADO: Record<number, number> = {
  3: 1,
  5: 2,
  1: 3,
  2: 4,
  4: 5,
}

function kpiCardClasses(
  active: boolean,
  tone: 'blue' | 'orange' | 'gray' | 'slate'
) {
  const base =
    'rounded-xl border p-3 text-left transition active:scale-[0.99] shadow-sm'
  const activeRing = active ? ' ring-2 ring-gray-500' : ''

  switch (tone) {
    case 'blue':
      return `${base} border-blue-500 bg-blue-200 ${activeRing}`
    case 'orange':
      return `${base} border-orange-500 bg-orange-200 ${activeRing}`
    case 'gray':
      return `${base} border-gray-500 bg-gray-200 ${activeRing}`
    case 'slate':
      return `${base} border-slate-500 bg-slate-200 ${activeRing}`
    default:
      return `${base} border-gray-300 bg-white ${activeRing}`
  }
}

export default function AdminMobileBoard({ rows, operarios }: Props) {
  const [soloNoFinalizadas, setSoloNoFinalizadas] = useState(true)
  const [filtroOf, setFiltroOf] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const resumen = useMemo(() => {
    return {
      enCurso: rows.filter((r) => r.estado_codigo === 3).length,
      pendientes: rows.filter((r) => r.estado_codigo === 1).length,
      asignadas: rows.filter((r) => r.estado_codigo === 2).length,
      suspendidas: rows.filter((r) => r.estado_codigo === 5).length,
      finalizadas: rows.filter((r) => r.estado_codigo === 4).length,
      noFinalizadas: rows.filter((r) => r.estado_codigo !== 4).length,
    }
  }, [rows])

  const filteredRows = useMemo(() => {
    const ofTerm = filtroOf.trim().toLowerCase()
    const clienteTerm = filtroCliente.trim().toLowerCase()

    const filtradas = rows.filter((row) => {
      if (soloNoFinalizadas && row.estado_codigo === 4) return false

      if (
        filtroEstado !== 'todos' &&
        row.estado_codigo !== Number(filtroEstado)
      ) {
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

    return filtradas.sort((a, b) => {
      const pa = PRIORIDAD_ESTADO[a.estado_codigo] ?? 99
      const pb = PRIORIDAD_ESTADO[b.estado_codigo] ?? 99
      if (pa !== pb) return pa - pb

      if (String(a.codigo_of) !== String(b.codigo_of)) {
        return String(a.codigo_of).localeCompare(String(b.codigo_of), undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      }

      return a.orden_operacion - b.orden_operacion
    })
  }, [rows, soloNoFinalizadas, filtroOf, filtroCliente, filtroEstado])

  function limpiarFiltros() {
    setFiltroOf('')
    setFiltroCliente('')
    setFiltroEstado('todos')
    setSoloNoFinalizadas(true)
  }

  function filtrarPorEstado(estado: '1' | '3' | '5') {
    setFiltroEstado(estado)
    setSoloNoFinalizadas(true)
  }

  function filtrarNoFinalizadas() {
    setFiltroEstado('todos')
    setSoloNoFinalizadas(true)
  }

  const kpiEnCursoActivo = filtroEstado === '3'
  const kpiSuspendidasActivo = filtroEstado === '5'
  const kpiPendientesActivo = filtroEstado === '1'
  const kpiNoFinalizadasActivo = soloNoFinalizadas && filtroEstado === 'todos'

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-900">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Panel ejecutivo</h2>
          <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700">
            {filteredRows.length} visibles
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => filtrarPorEstado('3')}
            className={kpiCardClasses(kpiEnCursoActivo, 'blue')}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-800">
              En curso
            </div>
            <div className="mt-1 text-xl font-bold text-blue-950">
              {resumen.enCurso}
            </div>
          </button>

          <button
            type="button"
            onClick={() => filtrarPorEstado('5')}
            className={kpiCardClasses(kpiSuspendidasActivo, 'orange')}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-orange-800">
              Suspendidas
            </div>
            <div className="mt-1 text-xl font-bold text-orange-950">
              {resumen.suspendidas}
            </div>
          </button>

          <button
            type="button"
            onClick={() => filtrarPorEstado('1')}
            className={kpiCardClasses(kpiPendientesActivo, 'gray')}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-800">
              Pendientes
            </div>
            <div className="mt-1 text-xl font-bold text-gray-950">
              {resumen.pendientes}
            </div>
          </button>

          <button
            type="button"
            onClick={filtrarNoFinalizadas}
            className={kpiCardClasses(kpiNoFinalizadasActivo, 'slate')}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-800">
              No finalizadas
            </div>
            <div className="mt-1 text-xl font-bold text-slate-950">
              {resumen.noFinalizadas}
            </div>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <Link
            href="/dashboard/admin/of/nueva"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900"
          >
            Nueva OF
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-900">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Buscar OF
            </label>
            <input
              type="text"
              value={filtroOf}
              onChange={(e) => setFiltroOf(e.target.value)}
              placeholder="Ej: PILOTO-001"
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

          <label className="flex items-center gap-3 text-sm text-gray-900">
            <input
              type="checkbox"
              checked={soloNoFinalizadas}
              onChange={(e) => setSoloNoFinalizadas(e.target.checked)}
              className="h-5 w-5"
            />
            <span>Sólo no finalizadas</span>
          </label>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900"
          >
            Limpiar filtros
          </button>
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