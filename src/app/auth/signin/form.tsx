'use client'

import { signIn } from 'next-auth/react';
import { FormEvent } from 'react'

export default async function LoginForm() {
    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget); 
        signIn('credentials', {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false,
        });
    }
    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
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
            <button className='btn-primary' type="submit">Continue</button>
        </div>
    )
}