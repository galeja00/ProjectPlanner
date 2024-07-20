"use client"
import Link from "next/link"
import LoginForm from "./form"
import { SessionProvider } from "next-auth/react"


export default function Login() {
    return (
        <main className="flex flex-col items-center mx-auto mt-20 bg-neutral-200 w-fit h-fit my-auto p-8 rounded">
            <h1 className='font-bold text-2xl'>Sign in</h1>
            <SessionProvider>
                <LoginForm/>
            </SessionProvider>
            <Link href="/auth/signup" className="link pt-8">I dont have a Account</Link>
        </main>
    )
}

