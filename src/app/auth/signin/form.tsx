'use client'

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react'

export default function LoginForm() {
    const [correctPsw, setCorrectPsw] = useState<boolean | null>(null); 
    const [correctEmail, setCorrectEmail] = useState<boolean | null>(null); 
    const [faildMsg, setFaildMsg] = useState<string>("");

    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: pridat validaci na klientovi
        const formData = new FormData(e.currentTarget); 
        const response = await signIn('credentials', {
            email: formData.get("email"),
            password: formData.get("password")
        });

        console.log({ response });
    }
    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
            <FormItem item="Email" type="email" name="email" correct={correctPsw}></FormItem>
            <FormItem item="Password" type="password" name="password" correct={correctEmail}></FormItem>
            <SendButton/>
            {faildMsg === "" ? <p>  </p> : <p className='text-red-500 w-fit m-auto'>{faildMsg}</p>}
        </form>
    )
}

function FormItem({ item, type, name, correct }: { item : string, type: string, name : string, correct : null | boolean }) {
    var inputClass = "input-primary";
    if (correct == false) {
        inputClass = "input-faild";
    }
    return (
        <div className='flex flex-col'>
            <label>{item}</label>
            <input type={type} name={name} className={inputClass}></input>
        </div>
    )
}

function SendButton() {
    return (
        <div className='w-fit m-auto'>
            <button className='btn-primary' type="submit">Continue</button>
        </div>
    )
}