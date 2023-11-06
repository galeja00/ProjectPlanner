import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Menu from './components/menu'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Project Planner',
  description: 'aplication for planning your teams and projects on one web side',
}

export default function ProjectLayout({
    children,
    params
  } : {
    children: React.ReactNode,
    params : { type : string, id : string }
  }) {
    return (
      <div className='flex'>
        <Menu id={params.id} type={params.type}></Menu>
        {children}
      </div>   
    )
  }