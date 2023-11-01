import Link from 'next/link'
import RegisterForm from "./form"

export default function Registr() {
    return (
        // TODO: pridat přesměrování pokud user už je přihlášen
        <main className="flex flex-col items-center mx-auto mt-20 bg-neutral-950 w-fit h-fit my-auto p-8 rounded">
            <h1 className='font-bold text-2xl'>Sign up</h1>
            <RegisterForm/>
            <Link href="/auth/signin" className='mt-8 link'>All ready have a account</Link>
        </main>
    )
}

