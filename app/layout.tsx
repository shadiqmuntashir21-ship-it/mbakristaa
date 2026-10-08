import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ETOS Pembinaan',
  description: 'Satu ruang kerja digital untuk seluruh perjalanan pembinaan Etoser.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
