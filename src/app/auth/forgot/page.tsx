'use client'
import { FormItem, SubmitButton } from '@/app/components/form';
import { FormEvent, useState } from 'react';
import EmailValidator from 'email-validator';
import { useRouter } from 'next/router';

enum Stage {
    Email = 0,
    Token = 1,
    Password = 2
}

export default function Page() {
    const [stage, setStage] = useState<Stage>(Stage.Email);
    const [userId, setUserId] = useState<string>("");
    const [token, setToken] = useState<string>("");
    const stages = [
        <ForgotFormEmail key={Stage.Email} updateStage={setStage} setUserId={setUserId}/>,
        <ForgotToken key={Stage.Token} userId={userId} updateStage={setStage}/>, 
        <ForgotFormPassword key={Stage.Password} token={token} userId={userId} updateStage={setStage} /> 
    ];
    const head = [ "1. Enter your email", "2. Enter your token", "3. Create a new password"];
    return (
        <main className="flex flex-col items-center mx-auto mt-20 bg-neutral-200 w-fit h-fit my-auto p-8 rounded">
            <h1 className='text-lg font-bold'>{head[stage]}</h1>
            {stages[stage]}
        </main>
    );
}

function ForgotFormEmail({ updateStage, setUserId } : { updateStage : (stage : Stage) => void, setUserId : (userId : string) => void }) {
    const [correctEmail, setCorrectEmail] = useState<boolean | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget); 
        const email = formData.get("email");
        // control if input are not empty
        if (!(email)) {
            setCorrectEmail(false);
            return;
        }
        // control email if email is valid
        if (!EmailValidator.validate(email.toString())) {
            setCorrectEmail(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/forgot', {
                method: "POST",
                body: JSON.stringify({
                    email: email
                })
            })
            const data = await res.json();
            if (res.ok) {
                setUserId(data.userId);
                updateStage(Stage.Email);
                return;
            }
   
            setErrorMsg(data.message);
        }
        catch (error) {
            console.error(error);
            setErrorMsg("Failed to send email");
            return;
        }
        
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8 pb-8 w-96'>
            <FormItem item="Email" type="email" name="email" correct={correctEmail}></FormItem>
            <SubmitButton text={"Submit"}/>
            {errorMsg === "" ? <p>  </p> : <p className='text-red-500 w-fit m-auto'>{errorMsg}</p>}
        </form>
    );
}

function ForgotToken({ userId, updateStage } : { userId : string, updateStage : (stage : Stage) => void }) {
    const [correctToken, setCorrectToken] = useState<boolean | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget); 
        const token = formData.get("token");
        try {
            const res = await fetch('/api/auth/forgot/token', {
                method: "POST",
                body: JSON.stringify({
                    email: userId,
                    token: token
                })
            })

            if (res.ok) {
                updateStage(Stage.Password);
                return;
            }
            const data = await res.json();
            setCorrectToken(false);
            setErrorMsg(data.message);
        }
        catch (error) {
            console.error(error);
            setErrorMsg("Failed to send token");
            return;
        }
        
    }
    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8 pb-8 w-96'>
            <label htmlFor="email">Token</label>
            <FormItem item="Token" type="text" name="token" correct={correctToken}></FormItem>
            <SubmitButton text={"Submit"}/>
            {errorMsg === "" ? <p>  </p> : <p className='text-red-500 w-fit m-auto'>{errorMsg}</p>}
        </form>
    );
}

function ForgotFormPassword({ token, userId, updateStage } : { token : string, userId : string, updateStage : (stage : Stage) => void }) {
    const [correctPassword, setCorrectPassword] = useState<boolean | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const router = useRouter();

    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget); 
        const password = formData.get("password");
        const repeatPassword = formData.get("repeatPassword");
        // control if input are not empty
        if (!(password)) {
            setCorrectPassword(false);
            return;
        }
        if (!(repeatPassword)) {
            setCorrectPassword(false);
            return;
        } 
        try {
            const res = await fetch('/api/auth/password/reset', {
                method: "POST",
                body: JSON.stringify({
                    token: token,
                    userId: userId,
                    password: password,
                    repeatPassword: repeatPassword
                })
            })

            if (res.ok) {
                router.push('/');
                return;
            }
            const data = await res.json();
            setErrorMsg(data.message);
        }
        catch (error) {
            console.error(error);
            setErrorMsg("Failed to change password");
            return;
        }
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8 pb-8 w-96'>
            <FormItem item="Password" type="password" name="password" correct={correctPassword}></FormItem>
            <FormItem item="Repeat Password" type="password" name="repeatPassword" correct={correctPassword}></FormItem>
            <SubmitButton text={"Submit"}/>
            {errorMsg === "" ? <p>  </p> : <p className='text-red-500 w-fit m-auto'>{errorMsg}</p>}
        </form>
    );
}