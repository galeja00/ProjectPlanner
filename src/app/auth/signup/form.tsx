'use client'

import { FormEvent, useState } from 'react';
import EmailValidator from 'email-validator';
import { useRouter } from 'next/navigation';
//import { FormItem, SubmitButton } from '@/app/components/form';

type Msg = {
    message : string,
    type : boolean
}

export default function RegisterForm() {
    const [correctPsw, setCorrectPsw] = useState<boolean | null>(null); 
    const [correctEmail, setCorrectEmail] = useState<boolean | null>(null); 
    const [correctName, setCorrectName] = useState<boolean | null>(null);
    const [correctSurName, setCorrectSurName] = useState<boolean | null>(null);
    const [Msg, setMsg] = useState<Msg>({ message: "",  type: false});
    const router = useRouter();

    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const name = formData.get("name");
        const surname = formData.get("surname");
        const password = formData.get("password");
        const repeatpassword = formData.get("repeatpassword");

        // TODO: validaci emailu a potvrzení emailove adresy... (nodemailer...)
        if (!(email && name && surname && password && repeatpassword )) {
            setMsg({ message: "You need to fill all inputs", type: false});
            setCorrectPsw(false);
            setCorrectEmail(false);
            setCorrectName(false);
            setCorrectSurName(false);
            return;
        }
        if (!EmailValidator.validate(email.toString())) {
            setCorrectEmail(false);
            setMsg({ message: "You need to insert valid email", type: false});
            return;
        }
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
                if  (!response.ok) {
                    setMsg({ message: "Error in communication with server, try again", type: false });
                } else {
                    setMsg({ message: "Succesfully registration", type: true});
                }
            } catch (error) {
                setMsg({ message: "Error in communication with server, try again", type: false });
            }
        } else {
            setCorrectPsw(false);
            setMsg({ message: "Your passwords arent same", type: false });
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
            <SubmitButton/>
            {Msg.message === "" ? <p>  </p> : <p className={`${Msg.type ? "text-green-500" : "text-red-500"} w-fit m-auto`}>{Msg.message}</p>}
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

function SubmitButton() {
    return (
        <div className='w-fit m-auto'>
            <button className='btn-primary' type="submit">Create Account</button>
        </div>
    )
}

