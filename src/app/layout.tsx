import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Menu from './components/menu'
import { ThemeProvider } from './context/theme'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Project Planner',
  description: 'Aplication for planning your teams and projects on one web side with kanban.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
        <body className={inter.className}>
          <Menu></Menu>
          {children}
        </body>
    </html>
  )
}
