import Image from 'next/image'
import { prisma } from '@/db'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1>Start planning your great projects and teams with Project planner</h1>
      <Link href="/authorize" className='btn-primary'>Start for free</Link>
    </main>
  )
}
