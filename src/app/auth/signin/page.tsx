import Link from "next/link"
import LoginForm from "./form"


export default function Login() {
    return (
        // TODO: pridat přesměrování pokud user už je přihlášen
        <main className="flex flex-col items-center mx-auto mt-20 bg-neutral-950 w-fit h-fit my-auto p-8 rounded">
            <h1 className='font-bold text-2xl'>Sign in</h1>
            <LoginForm/>
            <Link href="/auth/signup" className="link pt-8">I dont have a Account</Link>
        </main>
    )
}

