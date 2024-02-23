"use client"

import { useEffect, useState } from "react";
import Image from 'next/image' 
import { Main } from "next/document";
import { Tag, Task } from "@prisma/client";
import { on } from "stream";

export function TaskInfo({ id, projectId, handleClose } : { id : string, projectId : string, handleClose : () => void }) {
    const [task, setTask] = useState<Task | null>(null);
    async function fetchInfo() {
        try {
            const res = await fetch(`/api/projects/${projectId}/task/info`, {
                method: "GET"
            })
        }
        catch (error) {

        }
    }

    useEffect(() => {
        fetchInfo();
    }, []);

    return (
        <dialog className='absolute z-50 flex bg-neutral-950 bg-opacity-60 left-0 top-0 w-full h-full text-neutral-100 '>
            <div className='bg-neutral-950 rounded w-[60rem] h-[33rem] mx-72 my-36 overflow-hidden relative'>
                { task 
                    ?
                    <>
                        <HeaderContainer task={task} handleClose={handleClose}/>
                        <div className='flex h-full'>
                            <MainInfoContainer task={task}/>
                            <section className='py-2 px-4 w-[20rem] flex flex-col gap-4'>
                                <Data/>
                                <Solver/>
                            </section>
                        </div>
                    </>
                    :
                    <>
                        <h3>Loading...</h3>
                        <DialogClose handleClose={handleClose}/>
                    </>
                }
            </div>
        </dialog>
    ) 
}  

// HEADER PART //
function HeaderContainer({task, handleClose} : {task : Task, handleClose : () => void}) {
    return (
        <section className='px-6 py-4 border-b border-neutral-400 relative'>
            <Name taskName=""/>
            <TagList taskTags={[]}/>
            <DialogClose handleClose={handleClose}/>
        </section>
    )
}

function Name({taskName} : {taskName : string}) {
    const [name, setName] = useState<string>(taskName);
    function handleNameChange() {

    }

    return (
        <div>
            <h3 className='text-xl font-bold mb-4 '>{name}</h3>
            <button onClick={handleNameChange}><Image src={""} alt={""} height={10} width={10}></Image></button>
        </div>
    )
}

function TagList({taskTags} : {taskTags : Tag[]}) {
    const [tags, setTags] = useState<Tag[]>([]);
    function handleDeleteTag(tag : Tag) {

    }


    return (
        <ul className='flex gap-2 rounded-lg '>
            {
                tags.map((tag) => (
                    <TagElement tag={tag} handleDeleteTag={handleDeleteTag}/>
                ))
            }
        </ul>
    )
}

function TagElement({ tag, handleDeleteTag } : { tag : Tag, handleDeleteTag : (tag : Tag) => void }) {
    return (
        <li className='rounded-full bg-green-500 border border-green-500 bg-opacity-60 px-3 py-1 flex gap-3 text-sm'>
            {tag.name}
            <button onClick={() => handleDeleteTag(tag)}>
                <Image src={"/x.svg"} alt={"close"} className=""/>            
            </button>
        </li>
    )
}

function DialogClose({ handleClose } : { handleClose : () => void}) {
    return (
        <button onClick={handleClose} className='absolute right-0 top-0 mt-2 mr-2'><Image src={'/x.svg'} alt={'close'} width={20} height={20}></Image></button>
    )
}

// MAIN INFRMATIONS

enum TypeOfInfo {
    description = "Description",
    issues = "Issues",
    nodes = "Nodes"
}

function MainInfoContainer({ task } : { task : Task }) {
    const menuItems : TypeOfInfo[] = [TypeOfInfo.description, TypeOfInfo.issues, TypeOfInfo.nodes];
    const [actualInfoType, setActualInfoType] = useState<TypeOfInfo>(menuItems[0]);
    var desc = "";
    if (task.description) {
        desc = task.description; 
    } 
    const [actualInfo, setActualInfo] = useState<JSX.Element>(<Description desc={desc}/>);

    function handleChangeType(type : TypeOfInfo) {

    }


    return (
        <section className=' w-[40rem] h-full border-r border-neutral-400'>
            <menu className='flex w-full border-b border-neutral-400'>
                {
                    menuItems.map((type) => (
                        <MenuItem name={type} onClick={() => handleChangeType(type)}></MenuItem>
                    ))
                }
            </menu>
            {actualInfo}
        </section>
    )
}

function MenuItem({ name, onClick } : { name : string, onClick : () => void}) {
    return (
        <li className='px-4 py-2'>
            <button onClick={onClick}>{name}</button>
        </li>
    )
}

function Description({ desc } : { desc : string}) {
    return (
        <article className='m-4'>
            <h4 className='font-bold mb-2'>Description</h4>
            <p className='p-2 bg-neutral-900 rounded '>
                v tomto ukolu vytvor pole kere bude sciat prvky kazdy s kazdym vyhodi vysledek na standartni vystup programu nasledně ho posle dalsi komponente ktera to zpracuje dodrzy prosim rozhrani
            </p>
        </article>
    )
}

function Issues() {
    return (
        <>
        </>
    )
}

function Nodes() {
    return (
        <>
        </>
    )
}

// DATA INFORMATIONS

function Data() {
    return (
        <div>
            <h3 className='font-bold mb-2'>Info</h3>
            <ul className='bg-neutral-900 p-2 rounded w-full flex flex-col gap-2'>
                <li className='flex gap-2'><span>type:</span><span>xxxxx</span></li>
                <li className='flex gap-2'><span>complexity:</span><span>low</span></li>
                <li className='flex gap-2'><span>estimated hours:</span><span>10</span></li>
                <li className='flex gap-2'><span>priority:</span><span>10</span></li>
            </ul>
        </div>
    )
}

function Solver() {
    return (
        <div>
            <h3 className='font-bold mb-2'>Solver</h3>
            <div className='bg-neutral-900 p-2 rounded w-full flex flex-row gap-1 relative'>
                <Image src="/avatar.svg" alt="avater" width={2} height={2} className='w-8 h-8 rounded-full bg-neutral-300 mr-2 text-color cursor-pointer'></Image>
                <div>Jakub Galeta</div>
                <button className='btn-primary absolute px-3 py-1 right-0 mr-2'>Change</button>
            </div>
        </div>
    )
}