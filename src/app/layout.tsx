import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Menu from './components/menu'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Project Planner',
  description: 'aplication for planning your teams and projects on one web side',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    //TODO: vyuzit useSession a upravit kontet podle toho jestli uztivatel je autorizován nebo není
    <html lang="en">
      
        <body className={inter.className}>
          <Menu></Menu>
          {children}
        </body>
      
    </html>
  )
}
