'use client'

import { useEffect, useMemo, useState } from 'react'
import OfOperacionActionsMobile from '@/components/of-operacion-actions-mobile'

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
  row: PanelRow
  mostrarAsignadoA?: boolean
}

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

function formatEstimatedHours(hours: number | null) {
  if (hours == null) return '-'
  return formatDuration(Math.round(hours * 3600 * 1000))
}

function estadoClasses(estadoCodigo: number) {
  switch (estadoCodigo) {
    case 1:
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 2:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 3:
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 4:
      return 'bg-green-100 text-green-800 border-green-300'
    case 5:
      return 'bg-orange-100 text-orange-800 border-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export default function OfOperacionMobileCard({
  row,
  mostrarAsignadoA = false,
}: Props) {
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

    const id = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(id)
  }, [mounted, row.estado_codigo, row.fecha_inicio, row.fecha_fin])

  const tiempoTranscurridoMs = useMemo(() => {
    const acumulado = (row.tiempo_acumulado_segundos ?? 0) * 1000

    if (row.estado_codigo !== 3) {
      return acumulado
    }

    const inicio = parseDate(row.fecha_inicio)
    if (!inicio) return acumulado

    if (!mounted || now == null) {
      return acumulado
    }

    return acumulado + (now - inicio.getTime())
  }, [
    row.tiempo_acumulado_segundos,
    row.estado_codigo,
    row.fecha_inicio,
    mounted,
    now,
  ])

  return (
    <article className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-900 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base text-gray-700">
            OF: <span className="font-semibold text-gray-900">{row.codigo_of}</span>
          </div>

          <div className="mt-1 text-sm text-gray-700">
            Cliente: <span className="font-medium text-gray-900">{row.cliente}</span>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${estadoClasses(
            row.estado_codigo
          )}`}
        >
          {row.estado_nombre}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-700">
          Operación número <span className="font-bold text-gray-900">{row.orden_operacion}</span>
        </div>

        <div className="text-sm text-gray-700">
          Variante:{' '}
          <span className="text-gray-900">
            {row.codigo_variante
              ? `${row.codigo_variante} - ${row.descripcion_variante ?? ''}`
              : 'Sin variante'}
          </span>
        </div>

        <div className="text-base font-medium text-gray-900">
          {row.codigo_operacion} - {row.descripcion_operacion}
        </div>

        {mostrarAsignadoA && (
          <div className="text-sm text-gray-700">
            Asignado a:{' '}
            <span className="text-gray-900">{row.persona_nombre ?? 'Sin asignar'}</span>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Inicio</div>
          <div className="text-sm font-medium text-gray-900">
            {formatDateTime(row.fecha_inicio)}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Fin</div>
          <div className="text-sm font-medium text-gray-900">
            {formatDateTime(row.fecha_fin)}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Tiempo estimado
          </div>
          <div className="text-sm font-medium text-gray-900">
            {formatEstimatedHours(row.tiempo_estimado_horas)}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Tiempo transcurrido
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatDuration(tiempoTranscurridoMs)}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <OfOperacionActionsMobile
          ofOperacionId={row.of_operacion_id}
          estadoCodigo={row.estado_codigo}
        />
      </div>
    </article>
  )
}