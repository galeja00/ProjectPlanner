"use client"
import { Oval } from 'react-loader-spinner'
import { LoadingOval } from './components/other'


export default function Loading() {
    return (
        <main className="flex h-full w-full flex-col font-bold justify-center items-center text-neutral-200">
            <LoadingOval/>
        </main>
    )
  }