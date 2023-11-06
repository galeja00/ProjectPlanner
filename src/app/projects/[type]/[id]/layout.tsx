import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Menu from './components/menu'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { options } from '@/app/api/auth/[...nextauth]/options'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata =  {
  title: 'Project Planner',
  description: 'aplication for planning your teams and projects on one web side',
}

export default async function ProjectLayout({
    children,
    params
  } : {
    children: React.ReactNode,
    params : { type : string, id : string }
  }) {
    const session = await getServerSession(options);

    if (!session) {
        redirect("/auth/signup");
    }
    return (
      <div className='flex'>
        <Menu id={params.id} type={params.type}></Menu>
        {children}
      </div>   
    )
  }