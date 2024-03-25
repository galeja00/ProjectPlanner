"use client"
import { useRouter } from 'next/navigation';
import { Head } from "../components/other";
import Image from "next/image";
import { useEffect, useReducer, useState } from 'react';
import DropImage from '@/app/components/drop-image';

import { Project } from '@prisma/client';

enum Status {
    InWork = "In Work",
    Done = "Done"
}

export default function Settings({ params } : { params : { id : string }}) {
    const router = useRouter();
    const [ isImgDrop, toggleImgDrop ] = useReducer(isImgDrop => !isImgDrop, false);
    const [ project, setProject ] = useState<Project | null>(null); 


    async function fetchProjectInfo() {
        try {
            const res = await fetch(`/api/projects/${params.id}`, {
                method: "GET"
            });

            if (!res.ok) {
                return;
            }

            const data = await res.json();
            setProject(data.project);
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {fetchProjectInfo()}, []);

    async function updateImg(image : File) {
        try {
            const formData = new FormData();
            formData.append('image', image);
            const res = await fetch(`/api/projects/${params.id}/image `, {
                method: "POST",
                body: formData
            })
            const data = await res.json();
            if (res.ok) {
                if (project) {
                    project.icon = data.icon;
                    setProject(project);
                    toggleImgDrop();
                }
            }
        }
        catch (error) {
            console.error(error); 
        }
    }

    async function handleDelete() {
        try {
            const res = await fetch(`/api/projects/${params.id}/delete`, {
                method: "POST"
            }); 

            if (res.ok) {
                router.push("/projects"); 
                return;
            }

            const data = await res.json();
            throw new Error(data.error);
        }
        catch (error) {
            console.error(error);
        }
    }
    if (!project) {
        return (
            <main className="flex w-2/4 flex-col mx-auto py-14">
                <h1>Loading ...</h1>
            </main>
        )
    }

    const date = new Date(project.createdAt);
    let formattedDate = "";
    const day = date.getDate();
    const month = date.getMonth() + 1; // Měsíce jsou indexovány od nuly, takže přidáme 1
    const year = date.getFullYear();
    formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
    
    const state = project.done ? Status.Done : Status.InWork;
    const icon = project.icon ? `/uploads/project/${project.icon}` : "/project.svg";

    return (
        <>
            { isImgDrop && <DropImage closeDrop={toggleImgDrop} updateImg={updateImg}/>}
            <main className="flex w-2/4 flex-col mx-auto py-14">
                <Head text="Settings"/>
                <div className="space-y-8">
                    <section className="bg-neutral-950 p-4 rounded flex gap-8">
                        <Image src={icon} onClick={toggleImgDrop} alt="Project Logo" height={150} width={150} className="bg-neutral-50 rounded w-32 h-32 block hover:outline hover:outline-violet-600 cursor-pointer"/>
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">{project.name}</h2>
                        </div>
                    </section>
                    <section className="bg-neutral-950 p-4 rounded">
                        <ul className="space-y-4">
                            <li className="grid grid-cols-3 gap-2"><div>category:</div> <div>{project.category}</div></li>
                            <li className="grid grid-cols-3 gap-2"><div>create at:</div> <div>{formattedDate}</div></li>
                            <li className="grid grid-cols-3 gap-2"><div>state:</div> <div>{state}</div></li>
                            <li className="grid grid-cols-3 gap-2"><div>color:</div> <div className="rounded-full bg-blue-600 w-6 h-6" style={{ backgroundColor: project.color }}></div></li>
                        </ul>
                    </section>
                    <ButtonDel onClick={handleDelete}/>
                </div>
                
            </main>
        </>
        
    )
}




function ButtonDel({ onClick } : { onClick : () => void }) {
    return (
        <button className="btn-destructive" onClick={onClick}>Delete</button>
    )
}