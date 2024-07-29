"use client"
import { LoadingOval } from './components/other'


export default function Loading() {
    return (
        <main className="flex h-screen w-screen flex-col font-bold justify-center items-center text-neutral-200">
            <LoadingOval/>
        </main>
    )
  }