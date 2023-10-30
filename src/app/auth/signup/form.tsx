'use client'

import { FormEvent } from 'react'

export default async function RegisterForm() {
    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // dodelat jestli jsou pasword a reapet pasword stejna
        const response = await fetch('/api/auth/signup', {
            method: "POST",
            body: JSON.stringify({
                email: formData.get("email"),
                name: formData.get("name"),
                surname: formData.get("surname"),
                password: formData.get("password")
            })
        }) 
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8 pb-8 border-b '>
            <FormItem item="Email" name="email" type="email"/>
            <div className='flex flex-row gap-4'>
                <FormItem item="Name" name="name" type="text"/>
                <FormItem item="Surname" name="surname" type="text"/>
            </div>
            <FormItem item="Password" name="password" type="password"/>
            <FormItem item="Repeat Password" name="repeatpassword" type="password"/>
            <SendButton/>
        </form>
    )
}

function FormItem({ item, type, name }: { item : string, type: string, name : string }) {
    return (
        <div className='flex flex-col'>
            <label>{item}</label>
            <input type={type} name={name} className='input-primary'></input>
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