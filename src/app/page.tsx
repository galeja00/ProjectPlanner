import Image from 'next/image'
import { prisma } from '@/db'
import Link from 'next/link'

export default async function Home() {
  const users = await prisma.user.findMany();
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1>Start planning your great projects and teams with Project planner</h1>
      {users.map(u => (
        <li key={u.id}>{u.name} {u.surname}, {u.email}</li>
      ))}
      <Link href="auth/signup" className='btn-primary'>Start for free</Link>
    </main>
  )
}


