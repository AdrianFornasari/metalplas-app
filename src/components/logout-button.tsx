'use client'

import { logout } from '@/app/logout/actions'
import { Button } from '@/components/ui/button'

type Props = {
  label?: string
}

export default function LogoutButton({ label = 'Cerrar sesión' }: Props) {
  return (
    <form action={logout}>
      <Button
        type="submit"
        variant="outline"
        className="min-h-11 rounded-xl border-gray-300 bg-white px-4 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900"
      >
        {label}
      </Button>
    </form>
  )
}