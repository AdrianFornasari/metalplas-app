'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Operacion = {
  id: number
  codigo: string
  descripcion: string
}

type Variante = {
  id: number
  operacion_id: number
  codigo: string
  descripcion: string
  tiempo_estimado_horas: number | null
}

type ItemForm = {
  operacionId: string
  varianteCodigo: string
}

type Props = {
  rolePath: 'admin' | 'supervisor'
  operaciones: Operacion[]
  variantes: Variante[]
}

export default function NuevaOfForm({
  rolePath,
  operaciones,
  variantes,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [codigo, setCodigo] = useState('')
  const [cliente, setCliente] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [items, setItems] = useState<ItemForm[]>([
    { operacionId: '', varianteCodigo: '' },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const operacionesById = useMemo(() => {
    const map = new Map<number, Operacion>()
    for (const op of operaciones) map.set(op.id, op)
    return map
  }, [operaciones])

  function filaIncompleta(item: ItemForm) {
    return !item.operacionId || !item.varianteCodigo
  }

  function addItem() {
    const indiceIncompleto = items.findIndex(filaIncompleta)

    if (indiceIncompleto !== -1) {
      setError(
        `Completá operación y variante en la fila ${indiceIncompleto + 1} antes de agregar otra.`
      )
      setOk('')
      return
    }

    setError('')
    setItems((prev) => [...prev, { operacionId: '', varianteCodigo: '' }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, patch: Partial<ItemForm>) {
    setError('')
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    )
  }

  function variantesDeOperacion(operacionId: string) {
    const opId = Number(operacionId)
    if (!opId) return []
    return variantes.filter((v) => v.operacion_id === opId)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setOk('')

    if (!codigo.trim()) {
      setError('Ingresá un código de OF.')
      return
    }

    if (!cliente.trim()) {
      setError('Ingresá el cliente.')
      return
    }

    if (items.length === 0) {
      setError('Agregá al menos una operación.')
      return
    }

    for (const [index, item] of items.entries()) {
      if (!item.operacionId) {
        setError(`Falta elegir la operación en la fila ${index + 1}.`)
        return
      }

      if (!item.varianteCodigo) {
        setError(`Falta elegir la variante en la fila ${index + 1}.`)
        return
      }
    }

    const payload = items.map((item, index) => {
      const operacion = operacionesById.get(Number(item.operacionId))

      return {
        orden_operacion: index + 1,
        codigo_operacion: operacion?.codigo ?? '',
        codigo_variante: item.varianteCodigo,
      }
    })

    setLoading(true)

    const { data, error } = await supabase.rpc('rpc_crear_orden_fabricacion', {
      p_codigo: codigo.trim(),
      p_cliente: cliente.trim(),
      p_descripcion: descripcion.trim() || null,
      p_items: payload,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setOk(`OF creada correctamente. ID devuelto: ${data}`)

    router.push(`/dashboard/${rolePath}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {ok && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-700">
          {ok}
        </div>
      )}

      <section className="rounded-2xl border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Cabecera de OF</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Código OF</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: OF-2026-001"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Cliente</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Cliente"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Descripción</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2"
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción opcional"
          />
        </div>
      </section>

      <section className="rounded-2xl border p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Operaciones</h2>

          <button
            type="button"
            onClick={addItem}
            className="rounded-lg border px-4 py-2"
          >
            Agregar operación
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => {
            const variantesDisponibles = variantesDeOperacion(item.operacionId)

            return (
              <div key={index} className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">Fila {index + 1}</h3>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg border px-3 py-1"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm mb-1">Operación</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
                      value={item.operacionId}
                      onChange={(e) =>
                        updateItem(index, {
                          operacionId: e.target.value,
                          varianteCodigo: '',
                        })
                      }
                    >
                      <option value="">Seleccionar...</option>
                      {operaciones.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.codigo} - {op.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Variante</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
                      value={item.varianteCodigo}
                      onChange={(e) =>
                        updateItem(index, { varianteCodigo: e.target.value })
                      }
                      disabled={!item.operacionId}
                    >
                      <option value="">Seleccionar...</option>
                      {variantesDisponibles.map((v) => (
                        <option key={v.id} value={v.codigo}>
                          {v.codigo} - {v.descripcion}
                          {v.tiempo_estimado_horas != null
                            ? ` (${v.tiempo_estimado_horas} h)`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border px-4 py-2"
        >
          {loading ? 'Creando...' : 'Crear OF'}
        </button>

        <button
          type="button"
          className="rounded-lg border px-4 py-2"
          onClick={() => router.push(`/dashboard/${rolePath}`)}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}