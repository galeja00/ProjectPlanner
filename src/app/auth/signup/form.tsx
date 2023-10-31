'use client'

import { FormEvent, useState } from 'react'

export default function RegisterForm() {
    const [correctPsw, setCorrectPsw] = useState<boolean | null>(null); 
    const [correctEmail, setCorrectEmail] = useState<boolean | null>(null); 
    const [correctName, setCorrectName] = useState<boolean | null>(null);
    const [correctSurName, setCorrectSurName] = useState<boolean | null>(null);
    const [faildMsg, setFaildMsg] = useState<string>("");

    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") ?? null;
        const name = formData.get("name") ?? null;
        const surname = formData.get("surname") ?? null;
        const password = formData.get("password") ?? null;
        const repeatpassword = formData.get("repeatpassword") ?? null;

        if (!(email && name && surname && password && repeatpassword)) {
            setFaildMsg("You nee fill all inputs");
            setCorrectPsw(false);
            setCorrectEmail(false);
            setCorrectName(false);
            setCorrectSurName(false);
            return;
        }
        if (password == repeatpassword) {
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

            
            } else {
                setFaildMsg("Error in communication with server, try again");
            }

        } else {
            setCorrectPsw(false);
            setFaildMsg("Your passwords arent same");
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
            <button className='btn-primary' type="submit">Create Account</button>
        </div>
    )
}