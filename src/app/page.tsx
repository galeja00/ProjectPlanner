import { getServerSession } from 'next-auth/next'
import { options } from './api/auth/[...nextauth]/options'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getServerSession(options);

  if (session) {
    redirect("/projects");
  } else {
    redirect("/auth/signin");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 ">
      <h1 className='mb-10'>Start planning your great projects and teams with Project planner</h1>
      <Link href="auth/signup" className='btn-primary'>Sign Up</Link>
    </main>
  )
}


