import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Menu from './components/menu'

const inter = Inter({ subsets: ['latin'], weight: [ "600", "800" ]});

export const metadata: Metadata = {
  title: 'Project Planner',
  description: "An application designed for efficient team and project planning, featuring an intuitive Kanban board, Gantt diagram and Backlog for your projects. Streamline your team's workflow and gain better visibility into project progress.",
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
