'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
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

type KpiKey = 'enCurso' | 'suspendidas' | 'pendientes' | 'noFinalizadas' | null

function getKpiClasses(key: Exclude<KpiKey, null>, active: boolean) {
  const base =
    'rounded-xl border p-2 text-left transition active:scale-[0.99]'

  const styles = {
    enCurso: active
      ? 'border-blue-500 bg-blue-200 ring-2 ring-blue-300'
      : 'border-blue-300 bg-blue-100',
    suspendidas: active
      ? 'border-red-500 bg-red-200 ring-2 ring-red-300'
      : 'border-red-300 bg-red-100',
    pendientes: active
      ? 'border-yellow-500 bg-yellow-200 ring-2 ring-yellow-300'
      : 'border-yellow-300 bg-yellow-100',
    noFinalizadas: active
      ? 'border-gray-500 bg-gray-200 ring-2 ring-gray-300'
      : 'border-gray-300 bg-gray-100',
  }

  return `${base} ${styles[key]}`
}

export default function AdminMobileBoard({ rows }: Props) {
  const [soloNoFinalizadas, setSoloNoFinalizadas] = useState(true)
  const [filtroOf, setFiltroOf] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)
  const [activeKpi, setActiveKpi] = useState<KpiKey>('noFinalizadas')

  const resumen = useMemo(() => {
    return {
      enCurso: rows.filter((r) => r.estado_codigo === 3).length,
      pendientes: rows.filter((r) => r.estado_codigo === 1).length,
      suspendidas: rows.filter((r) => r.estado_codigo === 5).length,
      noFinalizadas: rows.filter((r) => r.estado_codigo !== 4).length,
    }
  }, [rows])

  const filteredRows = useMemo(() => {
    const ofTerm = filtroOf.trim().toLowerCase()
    const clienteTerm = filtroCliente.trim().toLowerCase()

    const filtradas = rows.filter((row) => {
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
    setActiveKpi('noFinalizadas')
  }

  function toggleKpi(next: Exclude<KpiKey, null>) {
    if (activeKpi === next) {
      setActiveKpi(null)
      setFiltroEstado('todos')
      setSoloNoFinalizadas(false)
      return
    }

    setActiveKpi(next)

    if (next === 'enCurso') {
      setFiltroEstado('3')
      setSoloNoFinalizadas(true)
      return
    }

    if (next === 'suspendidas') {
      setFiltroEstado('5')
      setSoloNoFinalizadas(true)
      return
    }

    if (next === 'pendientes') {
      setFiltroEstado('1')
      setSoloNoFinalizadas(true)
      return
    }

    if (next === 'noFinalizadas') {
      setFiltroEstado('todos')
      setSoloNoFinalizadas(true)
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-300 bg-white p-3 text-gray-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">Panel ejecutivo</h2>
          <span className="rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700">
            {filteredRows.length} visibles
          </span>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => toggleKpi('enCurso')}
            className={getKpiClasses('enCurso', activeKpi === 'enCurso')}
          >
            <div className="text-[10px] uppercase tracking-wide text-blue-800">
              En curso
            </div>
            <div className="mt-1 text-lg font-bold text-blue-950">{resumen.enCurso}</div>
          </button>

          <button
            type="button"
            onClick={() => toggleKpi('suspendidas')}
            className={getKpiClasses('suspendidas', activeKpi === 'suspendidas')}
          >
            <div className="text-[10px] uppercase tracking-wide text-red-800">
              Suspend.
            </div>
            <div className="mt-1 text-lg font-bold text-red-950">{resumen.suspendidas}</div>
          </button>

          <button
            type="button"
            onClick={() => toggleKpi('pendientes')}
            className={getKpiClasses('pendientes', activeKpi === 'pendientes')}
          >
            <div className="text-[10px] uppercase tracking-wide text-yellow-800">
              Pend.
            </div>
            <div className="mt-1 text-lg font-bold text-yellow-950">{resumen.pendientes}</div>
          </button>

          <button
            type="button"
            onClick={() => toggleKpi('noFinalizadas')}
            className={getKpiClasses('noFinalizadas', activeKpi === 'noFinalizadas')}
          >
            <div className="text-[10px] uppercase tracking-wide text-gray-700">
              Abiertas
            </div>
            <div className="mt-1 text-lg font-bold text-gray-950">
              {resumen.noFinalizadas}
            </div>
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href="/dashboard/admin/of/nueva"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900"
          >
            Nueva OF
          </Link>

          <Link
            href="/dashboard/admin/asignar"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900"
          >
            Asignar
          </Link>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900"
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3">
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
                  setActiveKpi(null)

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
                onChange={(e) => {
                  setSoloNoFinalizadas(e.target.checked)
                  setActiveKpi(e.target.checked ? 'noFinalizadas' : null)
                }}
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
        )}
      </div>

      {filteredRows.length === 0 && (
        <div className="rounded-2xl border border-gray-300 bg-white p-6 text-center text-gray-500">
          No hay operaciones visibles con esos filtros.
        </div>
      )}

      <div className="space-y-3">
        {filteredRows.map((row) => (
          <OfOperacionMobileCard
            key={row.of_operacion_id}
            row={row}
            mostrarAsignadoA={true}
            mostrarSemaforo={true}
          />
        ))}
      </div>
    </section>
  )
}