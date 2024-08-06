'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from "react"


export default function Add() {
    return (
        <main className="flex flex-col items-center p-24 ">
            <h1 className="main-head mb-8">Create new project</h1>
            <CreateProject/> 
        </main>
        
    )
}


function CreateProject() {
    const [correctName, setCorrectName] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<String>("");
    const router = useRouter();

    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name");

        if (!name || name.toString() === "") {
            setCorrectName(false);
            setErrorMsg("You need to fill Name input");
            return;
        }
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                body: JSON.stringify({
                    name: name
                })   
            })

            if (res.ok) {
                setCorrectName(true);
                router.push("/projects");
                return;
            }
            
            const data = await res.json();
            setErrorMsg(data.message); 
           
        } catch (error) {
            if (error instanceof Error) {
                setErrorMsg(error.message);
            }  else if (typeof error === 'string') {
                setErrorMsg(error);
            } else {
                setErrorMsg('An unknown error occurred');
            }
            
        }
    }

    var inputClass = "input-primary";
    if (!correctName) {
        inputClass = "input-faild";
    }
    return (
        <section className="bg-neutral-200 p-4 rounded flex">
            <section className="">
                <form className="flex flex-col gap-4 " onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label>Name</label>
                        <input  type="text" name="name" className={`w-96 ${inputClass}`}></input>
                    </div>
                    <div className="m-auto">
                        <button className="btn-primary" type="submit" >Create Project</button>
                    </div>
                    <p className='text-red-500 w-fit m-auto'>{errorMsg}</p>
                </form>
            </section>
        </section>
    )

} 