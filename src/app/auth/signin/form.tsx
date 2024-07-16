'use client'

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react'
import EmailValidator from 'email-validator';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormItem, SubmitButton } from '@/app/components/form';

// for user to login to account
export default function LoginForm() {
    const [correctPsw, setCorrectPsw] = useState<boolean | null>(null); 
    const [correctEmail, setCorrectEmail] = useState<boolean | null>(null); 
    const [faildMsg, setFaildMsg] = useState<string>("");
    const router = useRouter(); 

    // submiting inputs from user to endpoint
    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            const formData = new FormData(e.currentTarget); 
            const email = formData.get("email");
            const password = formData.get("password");
            // control if input are not empty
            if (!(email && password)) {
                setCorrectPsw(false);
                setCorrectEmail(false);
                setFaildMsg("You need to fill all inputs");
                return;
            }

            // control email if email is valid
            if (!EmailValidator.validate(email.toString())) {
                setCorrectEmail(false);
                setFaildMsg("You need to insert valid email");
                return;
            }
            
            // submit to NextAuth API
            const response = await signIn('credentials', {
                email: formData.get("email"),
                password: formData.get("password"),
                callbackUrl: "/"
            });
            
            // set errors if sign in fails
            if (response === null || response == undefined) {
                setCorrectPsw(false);
                setCorrectEmail(false);
                setFaildMsg("We didnt found this user credentials");
                return;
            }
        }
        catch (error) {
            setFaildMsg("Somnthing went wrong");
        }
        
    }
    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8 pb-8 border-b w-96'>
            <FormItem item="Email" type="email" name="email" correct={correctPsw}></FormItem>
            <FormItem item="Password" type="password" name="password" correct={correctEmail}></FormItem>
            <SubmitButton text={"Sign in"}/>
            {faildMsg === "" ? <p>  </p> : <p className='text-red-500 w-fit m-auto'>{faildMsg}</p>}
        </form>
    )
}


