
export default function Registr() {
    return (
        <main className="flex flex-col items-center mx-auto mt-20 bg-neutral-950 w-fit h-fit my-auto p-8 rounded">
            <h1 className='font-bold text-2xl'>Sign in</h1>
            <LoginForm/>
        </main>
    )
}

function LoginForm() {
    return (
        <form className='flex flex-col gap-4 mt-8'>
            <FormItem item="Email" type="email"></FormItem>
            <FormItem item="Password" type="password"></FormItem>
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
            <button className='btn-primary'>Continue</button>
        </div>
    )
}