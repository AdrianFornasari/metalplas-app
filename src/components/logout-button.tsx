'use client'

import { logout } from '@/app/logout/actions'

type Props = {
  label?: string
}

export default function LogoutButton({ label = 'Cerrar sesión' }: Props) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
      >
        {label}
      </button>
    </form>
  )
}