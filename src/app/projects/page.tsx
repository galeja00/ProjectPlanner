import { getServerSession } from 'next-auth/next'
import { options } from '../api/auth/[...nextauth]/options'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ListProjects from './projects'
import { SessionProvider } from 'next-auth/react'
import { ErrorBoundary } from '../components/error-handler'



export default async function Projects() {
    const session = await getServerSession(options);

    if (!session) {
        redirect("/auth/signup");
    }

    return (
        <main className="flex max-w-screen flex-col h-auto m-auto py-14 px-24">
            
            <div className='flex justify-between mb-8'>
                <h1 className='text-2xl font-bold'>Projects</h1>
                <Link href="/projects/add" className='btn-primary w-fit'>Create new Project</Link>
            </div>
            <ListProjects/>
        </main>
    )
}
