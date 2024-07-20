'use client'

import { signIn, useSession } from 'next-auth/react';
import { FormEvent, useEffect, useState } from 'react'
import EmailValidator from 'email-validator';
import { useRouter } from 'next/navigation';
import { FormItem, SubmitButton } from '@/app/components/form';

// for user to login to account
export default function LoginForm() {
    const [correctPsw, setCorrectPsw] = useState<boolean | null>(null); 
    const [correctEmail, setCorrectEmail] = useState<boolean | null>(null); 
    const [faildMsg, setFaildMsg] = useState<string>("");
    const router = useRouter(); 
    const { data: session, status } = useSession()

    if (status == "authenticated") {
        router.push('/');
    }
    

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
                redirect: false,
            });
            // set errors if sign in fails
            if (response && !response.ok) {
                setCorrectPsw(false);
                setCorrectEmail(false);
                setFaildMsg("Your password or email is invalid");
                return;
            }
            
            
            window.location.reload();
        }
        catch (error) {
            setFaildMsg("Somnthing went wrong");
        }
        
    }


    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8 pb-8 border-b border-neutral-700 w-96'>
            <FormItem item="Email" type="email" name="email" correct={correctPsw}></FormItem>
            <FormItem item="Password" type="password" name="password" correct={correctEmail}></FormItem>
            <SubmitButton text={"Sign in"}/>
            {faildMsg === "" ? <p>  </p> : <p className='text-red-500 w-fit m-auto'>{faildMsg}</p>}
        </form>
    )
}


