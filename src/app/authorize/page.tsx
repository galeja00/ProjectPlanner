import Link from 'next/link'

export default function Registr() {
    return (
        <main className="flex flex-col items-center mx-auto mt-20 bg-neutral-950 w-fit h-fit my-auto p-8 rounded">
            <h1 className='font-bold text-2xl'>Sign up</h1>
            <RegistrForm/>
            <Link href="" className='mt-8 link'>All ready have a account</Link>
        </main>
    )
}

function RegistrForm() {
    return (
        <form className='flex flex-col gap-4 mt-8 pb-8 border-b '>
            <FormItem item="Email" type="email"/>
            <div className='flex flex-row gap-4'>
                <FormItem item="Name" type="text"/>
                <FormItem item="Surname" type="text"/>
            </div>
            <FormItem item="Password" type="password"/>
            <FormItem item="Repeat Password" type="password"/>
            <SendButton/>
        </form>
    )
}

function FormItem({ item, type }: { item : string, type: string }) {
    return (
        <div className='flex flex-col'>
            <label>{item}</label>
            <input type={type} className='input-primary'></input>
        </div>
    )
}

function SendButton() {
    return (
        <div className='w-fit m-auto'>
            <button className='btn-primary'>Create Account</button>
        </div>
    )
}
