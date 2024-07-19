'use client'

import { Project } from '@prisma/client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image' 
import { formatDate } from '@/date';
import { InitialLoader } from '../components/other-client';
import { ErrorBoundary, useError } from '../components/error-handler';
import { ButtonSideText } from '../components/buttons';

export default function ProjectsContainer() {
    return (
        <ErrorBoundary>
            <Projects/>
        </ErrorBoundary>
    )
}

function Projects() {
    const [inWorkP, setInWorkP] = useState<Project[]>([]);
    const [doneP, setDoneP] = useState<Project[]>([]);
    const [initialLoading, setInitialLoading] = useState<boolean>(false);
    const { submitError } = useError();

    useEffect(() => {
        fetchProjects();
    }, [])

    async function fetchProjects() {
        setInitialLoading(true);
        try {
            const response = await fetch('/api/projects', {
                method: "GET"
            });
            
            if (!response.ok) {
                throw new Error('Error: fatch failed to load data'); 
            }
            
            const data = await response.json();
            const projects : Project[] = data.projects;

            const inWorkProjects = projects.filter((p) => !p.done);
            const doneProjects = projects.filter((p) => p.done);

            setInWorkP(inWorkProjects);
            setDoneP(doneProjects);
        } 
        catch (error) {
            console.error(error);
            submitError(error, fetchProjects);
        }
        finally {
            setInitialLoading(false);
        }
        
    }  

    if (initialLoading) {
        return (
            <InitialLoader/>
        )
    }
    
    return (
        <div className='h-fit'>
            <ProjectList name="In Work" list={inWorkP}/>
            <ProjectList name="Done" list={doneP}/>
        </div>
    )
}


function ProjectList({ name, list } : { name : string, list : Project[] }) {
    const [[bottom, top], setIndexes] = useState<number[]>([0, 4]);

    function changeIndex(n : number) {
        if (n < 0) {
            if (bottom == 0) {
                return;
            }
        } else {
            if (top == list.length - 1) {
                return;
            } 
        }
        setIndexes([bottom + n, top + n]);
    }

    return (
        <section className='relative'>
            <div className='flex justify-between items-center mb-4 '>
                <h2 className='text-xl  font-bold'>{name}</h2>
                {list.length > (top - bottom) + 1 ?
                        <div className='flex gap-4'>
                            <button onClick={() => changeIndex(-1)}><Image src="/arrow-small-left.svg" alt="to left" width={40} height={40} className='hover:stroke-violet-500 bg-neutral-200 rounded'></Image></button>
                            <button onClick={() => changeIndex(1)}><Image src="/arrow-small-right.svg" alt="to right" width={40} height={40} className='hover:stroke-violet-500 bg-neutral-200 rounded'></Image></button>
                        </div>
                    :
                        <></>
                }
            </div>
            <ul className='relative flex gap-4 mb-4 w-full h-64 bg-neutral-200 rounded'>
                {list.map((p, i) => (
                    <ProjectItem key={p.id} proj={p} index={i} vis={[bottom, top]}/>
                ))}
            </ul>
        </section>
    )
}

function ProjectItem({ proj, index, vis } : { proj : Project, index : number, vis : number[] }) {
    const linkTo = "/projects/" + proj.id;
    var visible = "relative";
    if (index < vis[0] || index > vis[1]) {
        visible = "hidden";
    } 
    const icon = proj.icon ? `/uploads/project/${proj.icon}` : "/project.svg";
    return (
        <li key={proj.id} className={`overflow-hidden bg-neutral-100 rounded w-96 h-auto m-2 ${visible}`}>
            <div className='absolute w-96 h-10' style={{backgroundColor: proj.color}}></div>
            <Image src={icon} alt="avater" width={50} height={50} className='w-12 h-12 rounded bg-neutral-50 mr-5 text-color cursor-pointer absolute z-10 left-4 top-4'></Image>
            <div className='p-4 mt-16'>
                <h3 className='relative z-10 text-xl mb-2 font-bold'>{proj.name}</h3>
                <dl className='mb-4 space-y-2'>
                    <div className='flex gap-4'>
                        <dt>Category: </dt>
                        <dd>{proj.category ? proj.category : "undefined"}</dd>
                    </div>
                    <div className='flex gap-4'>
                        <dt>Create At: </dt>
                        <dd>{formatDate(new Date(proj.createdAt))}</dd>
                    </div>
                </dl>
                <div className='flex justify-end items-end'>
                    <Link href={linkTo} className='btn-primary relative z-10'>Open</Link>
                </div>
            </div>
        </li>
    )
}