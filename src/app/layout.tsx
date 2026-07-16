import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Metalplas App',
  description: 'Panel operativo de producción Metalplas',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily:
            'Roboto, "Segoe UI", Arial, Helvetica, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  )
}