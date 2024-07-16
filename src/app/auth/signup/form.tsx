'use client'

import { FormEvent, useState } from 'react';
import EmailValidator from 'email-validator';
import { useRouter } from 'next/navigation';
import { FormItem, SubmitButton } from '@/app/components/form';

type Msg = {
    message : string,
    type : boolean
}

export default function RegisterForm() {
    // state of every input if is correct or incorrect filled by user
    const [correctPsw, setCorrectPsw] = useState<boolean | null>(null); 
    const [correctEmail, setCorrectEmail] = useState<boolean | null>(null); 
    const [correctName, setCorrectName] = useState<boolean | null>(null);
    const [correctSurName, setCorrectSurName] = useState<boolean | null>(null);
    const [Msg, setMsg] = useState<Msg>({ message: "",  type: false}); // error message
    const router = useRouter();

    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const name = formData.get("name");
        const surname = formData.get("surname");
        const password = formData.get("password");
        const repeatpassword = formData.get("repeatpassword");
        try {
            // validet if user fild all inputs
            if (!(email && name && surname && password && repeatpassword )) {
                setMsg({ message: "You need to fill all inputs", type: false});
                setCorrectPsw(false);
                setCorrectEmail(false);
                setCorrectName(false);
                setCorrectSurName(false);
                return;
            }
            // validete if email is looking like real one
            if (!EmailValidator.validate(email.toString())) {
                setCorrectEmail(false);
                setMsg({ message: "You need to insert valid email", type: false});
                return;
            }
            // chack if passwords are same
            if (password == repeatpassword) {
                try {
                    var response = await fetch('/api/auth/signup', {
                        method: "POST",
                        body: JSON.stringify({
                            email: email,
                            name: name,
                            surname: surname,
                            password: password,
                            repeatpassword: repeatpassword
                        })
                    }) 

                    // chack if response from API is OK
                    if  (!response.ok) {
                        setMsg({ message: "Error in communication with server, try again", type: false });
                    } else {
                        setMsg({ message: "Succesfull registration", type: true});
                        router.push("/");
                    }
                } catch (error) {
                    setMsg({ message: "Error in communication with server, try again", type: false });
                }
            } else {
                setCorrectPsw(false);
                setMsg({ message: "Your passwords aren't same", type: false });
            }
        }
        catch (error) {
            setMsg({ message: "Somthing went wrong", type: false });
        }
        
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8 pb-8 border-b '>
            <FormItem item="Email" name="email" type="email" correct={correctEmail}/>
            <div className='flex flex-row gap-4'>
                <FormItem item="Name" name="name" type="text" correct={correctName}/>
                <FormItem item="Surname" name="surname" type="text" correct={correctSurName}/>
            </div>
            <FormItem item="Password" name="password" type="password" correct={correctPsw}/>
            <FormItem item="Repeat Password" name="repeatpassword" type="password" correct={correctPsw}/>
            <SubmitButton text={"Sign up"}/>
            {Msg.message === "" ? <p>  </p> : <p className={`${Msg.type ? "text-green-500" : "text-red-500"} w-fit m-auto`}>{Msg.message}</p>}
        </form>
    )
}


