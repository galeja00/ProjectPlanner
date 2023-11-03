import { getServerSession } from 'next-auth/next'
import { options } from '../api/auth/[...nextauth]/options'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Project } from '@prisma/client'
import ListProjects from './projects'



export default async function Projects() {
    const session = await getServerSession(options);

    if (!session) {
        redirect("/auth/signup");
    }
    var email = session.user?.email ?? "";
    return (
        <main className="flex min-h-screen flex-col items-center p-24 ">
            <h1>Projects</h1>
            <Link href="/projects/add" className='btn-primary'>Add Project</Link>
            <ListProjects/>
        </main>
    )
}
