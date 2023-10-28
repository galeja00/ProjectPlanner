import Link from 'next/link'

export default function Registr() {
    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <h1 className=''>Sign up</h1>
            <RegistrForm/>
            <Link href="">All ready have a account</Link>
            
            
        </main>
    )
}

function RegistrForm() {
    return (
        <form className='flex flex-col gap-4 mt-9 mb-9'>
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
            <input type={type} className='text-slate-950'></input>
        </div>
    )
}

function SendButton() {
    return (
        <div className='w-fit m-auto'>
            <button className='px-4 py-2 border'>Continue</button>
        </div>
    )
}
