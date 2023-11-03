'use client'

import { Project } from '@prisma/client'
import { useEffect, useState } from 'react';

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
            console.log(data);
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
                <h2>In Work</h2>
                <ul>
                    {inWorkP.map((p) => (
                        <li><h3>{p.name}</h3></li>
                    ))}
                </ul>
            </section>
            <section>
                <h2>Done</h2>
                <ul>
                    {doneP.map((p) => (
                        <li><h3>{p.name}</h3></li>
                    ))}
                </ul>
            </section>
        </>
    )
}

