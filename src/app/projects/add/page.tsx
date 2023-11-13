'use client'

import { ProjectType } from "@prisma/client"
import { redirect } from 'next/navigation'
import { FormEvent, useState } from "react"

// TODO: Bug v pridavani vyhazuje error ale pritom zadny nevznikl a pri nevlozeni napriklad jmena vraci to na prvni obrazovku
export default function Add() {
    const [type, setType] = useState<ProjectType | null>(null);

    function handleTypeChouce(type : ProjectType) : void {
        setType(type);
    }

    function resetType() : void {
        setType(null);
    }

    
    return (
        <main className="flex flex-col items-center p-24 ">
            <h1 className="main-head mb-8">Create new project</h1>
            { type == null ? 
            <TypeChoose handleTypeChouce={handleTypeChouce}/>
            :
            <CreateProject type={type} resetType={resetType}/> 
            } 
        </main>
        
    )
}


function TypeChoose({ handleTypeChouce } : { handleTypeChouce : (type : ProjectType) => void}) {
    return (
        <section className="bg-neutral-950 p-8 rounded">
            <h2 className="mb-8 text-xl">Choose type of project planning</h2> 
            <div className="flex gap-4">
                <div onClick={() => handleTypeChouce(ProjectType.Kanban)} className="p-40 bg-neutral-800 rounded cursor-pointer hover:bg-neutral-700">Kanban</div>
                <div onClick={() => handleTypeChouce(ProjectType.Scrum)} className="p-40 bg-neutral-800 rounded cursor-pointer hover:bg-neutral-700">Scrum</div>
            </div>
        </section>
    )
}

function CreateProject({ type, resetType } : { type : ProjectType, resetType : () => void}) {
    const [correctName, setCorrectName] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<String>("");

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
            const response = await fetch('/api/projects', {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    type: type
                })   
            })

            if (!response) {
                setCorrectName(true);
                redirect("/projects");
                return;
                  
            }
            
            const data = await response.json();
            setErrorMsg(data.error); 
           
        } catch (error) {
            setErrorMsg("Something went wrong");
        }
    }

    var inputClass = "input-primary";
    if (!correctName) {
        inputClass = "input-faild";
    }
    return (
        <section className="bg-neutral-950 p-8 rounded flex">
                <section className="pr-8 border-r">
                    <h2 className="mb-8 text-xl">Choose name</h2>
                    <form className="flex flex-col gap-4 " onSubmit={handleSubmit}>
                        <div className="flex flex-col">
                            <label>Name</label>
                            <input type="text" name="name" className={inputClass}></input>
                        </div>
                        <div className="m-auto">
                            <button className="btn-primary" type="submit" >Create Project</button>
                        </div>
                        <p className='text-red-500 w-fit m-auto'>{errorMsg}</p>
                    </form>
                </section>
                <section className="pl-8">
                    <h2 className="mb-8 text-xl">Your selected type</h2>
                    <p>{type}</p>
                    <button onClick={resetType} className="link relative">Change</button>
                </section>
            </section>
    )

} 