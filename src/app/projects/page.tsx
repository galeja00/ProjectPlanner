import { getServerSession } from 'next-auth/next'
import { options } from '../api/auth/[...nextauth]/options'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Project } from '@prisma/client'
import ListProjects from './projects'
import { SessionProvider } from 'next-auth/react'



export default async function Projects() {
    const session = await getServerSession(options);

    if (!session) {
        redirect("/auth/signup");
    }
    var email = session.user?.email ?? "";
    return (
        <main className="flex min-h-screen max-w-screan flex-col p-24">
            <div className='flex justify-between'>
                <h1 className='text-4xl mb-4 font-bold'>Projects</h1>
                <Link href="/projects/add" className='btn-primary w-fit mb-4'>Add Project</Link>
            </div>
            <ListProjects/>
        </main>
    )
}
