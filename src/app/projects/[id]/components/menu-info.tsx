'use client'
import { Project } from '@prisma/client';
import Image from 'next/image'
import { useEffect, useState } from 'react'


export function ProjectInfo( { id } : { id : string }) {
    const [info, setInfo] = useState<Project | null>();
    if (!info || info.id != id) {
           
    }
    useEffect(() => {
        getProjectInfo(id);
    }, [])  
    
    async function getProjectInfo(id : string) : Promise<void> {
        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error('Error: fatch failed to load data'); 
            }

            const data = await response.json();
            const project : Project = data.project;

            setInfo(project);
        } 
        catch (error) {
            console.log(error);
        }
    }

    const icon = info?.icon ? `/uploads/project/${info.icon}` : "/project.svg"

    return (
        <div className="flex gap-4">
            <Image src={icon} alt="Project Icon" width={50} height={50} className="bg-neutral-100 rounded w-10 h-fit block mt-auto mb-auto border-2" style={{ borderColor: info?.color}}></Image>
            <div className=''>
                <h2>{info?.name ? info.name : ""}</h2>
                <p className=" text-sm text-neutral-400">{info?.category ? info.category : "undefined"}</p>
            </div>
        </div>
    )
}