'use client'

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react'
import EmailValidator from 'email-validator';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
    const [correctPsw, setCorrectPsw] = useState<boolean | null>(null); 
    const [correctEmail, setCorrectEmail] = useState<boolean | null>(null); 
    const [faildMsg, setFaildMsg] = useState<string>("");
    const router = useRouter(); 


    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget); 
        const email = formData.get("email");
        const password = formData.get("password");
        if (!(email && password)) {
            setCorrectPsw(false);
            setCorrectEmail(false);
            setFaildMsg("You need to fill all inputs");
            return;
        }
    
        if (!EmailValidator.validate(email.toString())) {
            setCorrectEmail(false);
            setFaildMsg("You need to insert valid email");
            return;
        }
        
        const response = await signIn('credentials', {
            email: formData.get("email"),
            password: formData.get("password")
        });
        
        if (response && response.ok) {
            setCorrectPsw(false);
            setCorrectEmail(false);
            setFaildMsg("We didnt found this user credentials");
            router.push("/dashboard");
            return;
        }
    }
    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8 pb-8 border-b w-96'>
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

