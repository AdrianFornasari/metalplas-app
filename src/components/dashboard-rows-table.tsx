'use client'

import { useEffect, useMemo, useState } from 'react'
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
  titulo: string
  mostrarAsignadoA: boolean
  mensajeVacio: string
}

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: '1', label: 'Pendiente' },
  { value: '2', label: 'Asignada' },
  { value: '3', label: 'En curso' },
  { value: '4', label: 'Finalizada' },
  { value: '5', label: 'Suspendida' },
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function parseDate(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDateTime(value: string | null) {
  const d = parseDate(value)
  if (!d) return '-'

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDuration(ms: number | null) {
  if (ms == null || ms < 0) return '-'

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function ElapsedTimeCell({ row }: { row: PanelRow }) {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    setNow(Date.now())
  }, [])

  useEffect(() => {
    const debeCorrer =
      mounted &&
      row.estado_codigo === 3 &&
      !!row.fecha_inicio &&
      !row.fecha_fin

    if (!debeCorrer) return

    const id = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(id)
  }, [mounted, row.estado_codigo, row.fecha_inicio, row.fecha_fin])

  const elapsedMs = useMemo(() => {
    const acumulado = (row.tiempo_acumulado_segundos ?? 0) * 1000

    if (row.estado_codigo !== 3) {
      return acumulado > 0 ? acumulado : null
    }

    const inicio = parseDate(row.fecha_inicio)
    if (!inicio) return acumulado > 0 ? acumulado : null

    if (!mounted || now == null) {
      return acumulado > 0 ? acumulado : null
    }

    return acumulado + (now - inicio.getTime())
  }, [
    row.tiempo_acumulado_segundos,
    row.estado_codigo,
    row.fecha_inicio,
    row.fecha_fin,
    mounted,
    now,
  ])

  return (
    <span className={row.estado_codigo === 3 ? 'font-bold text-gray-900' : ''}>
      {formatDuration(elapsedMs)}
    </span>
  )
}

export default function DashboardRowsTable({
  rows,
  titulo,
  mostrarAsignadoA,
  mensajeVacio,
}: Props) {
  const [soloNoFinalizadas, setSoloNoFinalizadas] = useState(true)
  const [filtroOf, setFiltroOf] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

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

  const totalNoFinalizadas = useMemo(
    () => rows.filter((row) => row.estado_codigo !== 4).length,
    [rows]
  )

  function limpiarFiltros() {
    setFiltroOf('')
    setFiltroCliente('')
    setFiltroEstado('todos')
    setSoloNoFinalizadas(true)
  }

  const colSpan = mostrarAsignadoA ? 11 : 10

  return (
    <section className="rounded-2xl border p-4">
      <div className="mb-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">{titulo}</h2>

          <div className="rounded-full border px-3 py-1 text-sm text-gray-700">
            {filteredRows.length} visibles
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

          <div className="flex items-end">
            <button
              type="button"
              onClick={limpiarFiltros}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={soloNoFinalizadas}
              onChange={(e) => setSoloNoFinalizadas(e.target.checked)}
              className="h-5 w-5"
            />
            Sólo no finalizadas
          </label>

          <div className="text-sm text-gray-600">
            No finalizadas: <strong>{totalNoFinalizadas}</strong>
          </div>
        </div>
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
              <th className="text-left py-2 pr-4">Tiempo transcurrido</th>
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

                <td className="py-2 pr-4">{formatDateTime(row.fecha_inicio)}</td>
                <td className="py-2 pr-4">{formatDateTime(row.fecha_fin)}</td>
                <td className="py-2 pr-4">
                  <ElapsedTimeCell row={row} />
                </td>
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