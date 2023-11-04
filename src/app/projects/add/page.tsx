'use client'

import { ProjectType } from "@prisma/client"
import { redirect } from 'next/navigation'
import { FormEvent, useState } from "react"

export default function Add() {
    const [type, setType] = useState<ProjectType | null>(null);
    const [correctName, setCorrectName] = useState<boolean | null>(null);
    const [errorMsg, setErrorMsg] = useState<String>("");

    function hadnleTypeChouce(type : ProjectType) {
        setType(type);
    }

    async function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault;
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name");

        if (!name || name.toString() === "") {
            setCorrectName(false);
            setErrorMsg("You need to fill Name input");
            return;
        }
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    type: type
                })   
            })

            if (!response.ok) {
                const data = await response.json();
                setErrorMsg(data.error);
            }
            return;
        } catch (error) {
            setErrorMsg("Somtinh went wrong");
        }
    
    }

    var inputClass = "input-primary";
    if (!correctName) {
        inputClass = "input-faild";
    }
    
    return (
        <main className="flex min-h-screen flex-col items-center p-24 ">
            <h1 className="mb-8">Choose type of project planning</h1> 
            { type == null ? 
            <div className="flex gap-4">
                <div onClick={() => hadnleTypeChouce(ProjectType.Kanban)} className="p-40 bg-neutral-950 rounded cursor-pointer hover:bg-neutral-800">Kanban</div>
                <div onClick={() => hadnleTypeChouce(ProjectType.Kanban)} className="p-40 bg-neutral-950 rounded cursor-pointer hover:bg-neutral-800">Scrum</div>
            </div>
            :
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col">
                    <label>Name</label>
                    <input type="text" name="name" className="input-primary"></input>
                </div>
                <button className="btn-primary" type="submit" >Create Project</button>
                <p className='text-red-500 w-fit m-auto'>{errorMsg}</p>
            </form>
            } 
        </main>
        
    )
}