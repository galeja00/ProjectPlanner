import Image from 'next/image'
import { prisma } from '@/db'

export default async function Home() {

  const users = prisma.user.findMany();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Hello Mom</h1>
    </main>
  )
}
