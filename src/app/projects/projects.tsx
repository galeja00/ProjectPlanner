'use client'

import { Project } from '@prisma/client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image' 

export default function ListProjects() {
    const [inWorkP, setInWorkP] = useState<Project[]>([]);
    const [doneP, setDoneP] = useState<Project[]>([]);
    
    useEffect(() => {
        getProjects();
    }, [])

        async function getProjects() {
        try {
            const response = await fetch('/api/projects');
            
            if (!response.ok) {
                throw new Error('Error: fatch failed to load data'); 
            }
            
            const data = await response.json();
            const projects : Project[] = data.projects;
    
            const inWorkProjects = projects.filter((p) => !p.done);
            const doneProjects = projects.filter((p) => p.done);
    
            setInWorkP(inWorkProjects);
            setDoneP(doneProjects);
        } catch (error) {
            console.error(error);
        }
        
    }  
    
    return (
        <>
            <section>
                <div>
                    <h2 className='text-2xl mb-4 font-bold'>In Work</h2>
                    {inWorkP.length > 5 ?
                            <div>
                                <button></button><button></button>
                            </div>
                        :
                            <></>
                    }
                </div>
                
                <ul className='flex gap-4 mb-4 width-full overflow-hidden'>
                    {inWorkP.map((p) => (
                        <ProjectItem key={p.id} proj={p}/>
                    ))}
                </ul>
            </section>
            <section>
                <h2 className='text-2xl mb-4 font-bold'>Done</h2>
                <ul className='flex gap-4 mb-4 width-full overflow-hidden'>
                    {doneP.map((p) => (
                        <ProjectItem key={p.id} proj={p}/>
                    ))}
                </ul>
            </section>
        </>
    )
}


function ProjectItem({ proj } : { proj : Project }) {
    const linkTo = "/projects/" + proj.id;
    return (
        <li key={proj.id} className=' relative overflow-hidden bg-neutral-950 rounded w-96 h-50 h-auto'>
            <div className='absolute w-96 h-10' style={{backgroundColor: proj.color}}></div>
            <Image src="/avatar.svg" alt="avater" width={2} height={2} className='w-12 h-12 rounded-full bg-neutral-300 mr-5 text-color cursor-pointer absolute z-10 left-6 top-4'></Image>
            <div className='p-4 mt-16'>
                <h3 className='relative z-10 text-xl mb-2 font-bold'>{proj.name}</h3>
                <dl>
                    <div className='flex gap-4'> 
                        <dt>Type :</dt>
                        <dd>{proj.type}</dd>
                    </div>
                </dl>
                <div className='flex justify-end items-end'>
                    <Link href={linkTo} className='btn-primary relative z-10'>Open</Link>
                </div>
            </div>
        </li>
    )
}

