"use client"
import { Oval } from 'react-loader-spinner'


export default function Loading() {
    return (
        <main className="flex h-full w-full flex-col font-bold justify-center items-center text-neutral-600">
            <Oval
                visible={true}
                height="80"
                width="80"
                color="#e5e5e5"
                ariaLabel="oval-loading"
            />
        </main>
    )
  }