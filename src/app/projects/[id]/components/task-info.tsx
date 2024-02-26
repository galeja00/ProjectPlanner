"use client"

import { useEffect, useReducer, useState, KeyboardEvent, SetStateAction, ChangeEvent, FormEvent } from "react";
import Image from 'next/image' 
import { Main } from "next/document";
import { Issue, Tag, Task } from "@prisma/client";
import { on } from "stream";

// TODO: Error handeling + loading screen
// dialog about displaying all info abou task
export function TaskInfo({ id, projectId, handleClose } : { id : string, projectId : string, handleClose : () => void }) {
    const [task, setTask] = useState<Task | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [error, setError] = useState<boolean>(false);
    async function fetchInfo() {
        try {
            const res = await fetch(`/api/projects/${projectId}/task/${id}/info`, {
                method: "GET"
            })

            const data = await res.json();
            if(!res.ok) {
                throw new Error(data.error);
            }
            setTask(data.task);
            setTags(data.tags);
        }
        catch (error) {
            console.error(error);
            setError(true);
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
                        <HeaderContainer task={task} tags={tags} handleClose={handleClose}/>
                        <div className='grid grid-cols-3 h-full'>
                            <MainInfoContainer task={task}/>
                            <section className='py-2 px-4 w-[20rem] flex flex-col gap-4'>
                                <Data task={task}/>
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
function HeaderContainer({task, tags, handleClose} : {task : Task, tags : Tag[], handleClose : () => void}) {
    return (
        <section className='px-6 py-4 border-b border-neutral-400 relative '>
            <Name taskName={task.name}/>
            <TagList taskTags={tags}/>
            <DialogClose handleClose={handleClose}/>
        </section>
    )
}

function Name({taskName} : {taskName : string}) {
    const [name, setName] = useState<string>(taskName);
    function handleNameChange() {

    }

    return (
        <div className="flex mb-4 gap-4">
            <h3 className='text-xl font-bold'>{name}</h3>
            <button onClick={handleNameChange} title="Edit Name">
                <Image src={"/pencil.svg"} alt={"custom name"} height={20} width={20}/>
            </button>
        </div>
    )
}

function TagList({taskTags} : {taskTags : Tag[]}) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [creating, toggle] = useReducer(creating => !creating, false);
    const [color, setColor] = useState<string>("#FFFFFF");
    const [name, setName] = useState<string>("");

    async function handleDeleteTag(delTag : Tag) {
        try {
            /*const res = await fetch("/api/[]/task/tag/delete", {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    color: color
                })
            })*/
            const newTags : Tag[] = [];
            for (const tag of tags) {
                if (tag.id != delTag.id) {
                    newTags.push(tag);
                }
            }
            setTags(newTags);
        }
        catch {

        }
    }

    async function handleCreateTag(name : string, color : string) {
        try {
            /*const res = await fetch("/api/[]/task/tag/create", {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    color: color
                })
            })*/
            const id = Math.random().toString();
            const newTags : Tag[] = tags;
            newTags.push({id: id, taskId: "asdads", name: name, color: color});
            setTags(newTags);
            toggle();
        }
        catch {

        }
    }

    function startCreatingTag() {
        toggle();
    }

    function handleKeyDown(event :  KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Escape') {
            toggle();
        } 
    }

    function handleColorChange(event: ChangeEvent<HTMLInputElement>) {
        setColor(event.currentTarget.value);
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setName(event.currentTarget.value);
    }

    return (
        <div className="flex gap-1 h-8">
            <ul className='flex gap-2 rounded-lg '>
                {
                    tags.map((tag) => (
                        <TagElement tag={tag} handleDeleteTag={handleDeleteTag}/>
                    ))
                }
            </ul>
            {
                creating ?
                    <div className="flex gap-2 items-center px-3 py-1 bg-neutral-900 rounded">
                        <input type="text" className="bg-neutral-900 outline-none border-b w-32 text-sm h-5 " id="tagName" onChange={handleInputChange} onKeyDown={handleKeyDown}></input>
                        <input type="color" value={color} onChange={handleColorChange} className="w-5 h-5 bg-neutral-950 rounded outline-nonecursor-pointer"></input>
                        <button onClick={() => handleCreateTag(name, color)} className="w-fit h-fit"><Image src={"/check.svg"} alt="submit" height={40} width={40} className="w-5 h-5 rounded bg-neutral-950"></Image></button>
                    </div>
                    :
                    <></>
            }
            <button title="Create Tag" onClick={startCreatingTag}>
                <Image src={"/plus.svg"} alt={"create tag"} height={20} width={20}/>
            </button>
        </div>
        
    )
}

function TagElement({ tag, handleDeleteTag } : { tag : Tag, handleDeleteTag : (tag : Tag) => void }) {
    const opacity = 0.6; // Průhlednost v rozmezí 0 až 1 (0 - 100%)
    const rgbaColor = `${tag.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
    //console.log(rgbaColor);
    return (
        <li className='rounded-full border px-3 py-1 flex gap-3 text-sm'
            style={{ backgroundColor: rgbaColor, borderColor: tag.color}}
        >
            {tag.name}
            <button onClick={() => handleDeleteTag(tag)}>
                <Image src={"/x.svg"} alt={"close"} height={5} width={5} className="w-full h-full"/>            
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
    const [actualTypeInfo, setActualInfoType] = useState<TypeOfInfo>(TypeOfInfo.description);
    
    const [actualInfo, setActualInfo] = useState<JSX.Element>(<Description task={task}/>);

    function handleChangeType(type : TypeOfInfo) {
        switch (type) {
            case TypeOfInfo.issues:
                setActualInfo(<Issues issues={[]}/>);
                setActualInfoType(TypeOfInfo.issues);
                break;
            case TypeOfInfo.nodes:
                setActualInfo(<Nodes/>);
                setActualInfoType(TypeOfInfo.nodes);
                break;
            default:
                setActualInfo(<Description task={task}/>);
                setActualInfoType(TypeOfInfo.description);
        }
    }


    return (
        <section className='col-span-2 border-r border-neutral-400'>
            <menu className='flex w-full border-b border-neutral-400'>
                {
                    menuItems.map((type) => (
                        <MenuItem name={type} actualType={actualTypeInfo} onClick={() => handleChangeType(type)}></MenuItem>
                    ))
                }
            </menu>
            {actualInfo}
        </section>
    )
}

function MenuItem({ name, actualType, onClick } : { name : string, actualType : TypeOfInfo, onClick : () => void}) {
    var bg : string = "bg-neutral-950";
    if (actualType == name) {
        bg = "bg-neutral-900";
    }
    return (
        <li className={`relative  ${bg}`}>
            <button onClick={onClick} className="hover:text-purple-600 px-4 py-2" >{name}</button>
        </li>
    )
}

function Description({ task } : { task : Task }) {
    var desc = "Create description for better understending of task";
    if (task.description) {
        desc = task.description; 
    } 
    return (
        <article className='m-4'>
            <p className='p-2 bg-neutral-900 rounded '>
                {desc}
            </p>
        </article>
    )
}

function Issues({ issues } : { issues : Issue[] }) {
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

enum Colors {
    Green = "green",
    Yellow = "yellow",
    Red = "red",
}

enum Complexity {
    Low = "low",
    Medium = "medium",
    Heigh = "heigh",
    Undefined = "undefined"
}

function Data({ task } : { task : Task }) {
    const undefined = "undefined";
    return (
        <div>
            <h3 className='font-bold mb-2'>Info</h3>
            <ul className='bg-neutral-900 p-2 rounded w-full flex flex-col gap-2'>
                <DataItem name="type" value={task.type}></DataItem>
                <DataItem name="priority" value={task.priority}></DataItem>
                <DataItem name="complexity" value={task.complexity}></DataItem>
                <DataItem name="estimated hours" value={task.estimatedHours}></DataItem>
            </ul>
        </div>
    )
}

function DataItem({name, value} : { name: string, value : any}) {
    var displaydVal : any = "undefined";
    if (value) {
        displaydVal = value;
    } 
    var textColor = "";
    if (name == "complexity" || name == "priority") {
        switch (value) {
            case Complexity.Heigh:
                textColor = Colors.Red;
                break;
            case Complexity.Medium:
                textColor = Colors.Yellow;
                break;
            case Complexity.Low:
                textColor = Colors.Green;
                break;
        }
    }  
    return (
        <li className='grid grid-cols-2 gap-2'>
            <span>{name}:</span>
            <span style={{ color:textColor }}>{displaydVal}</span>
        </li>
    )
}

function ChackUndef() {

}

function Solver() {
    //<button className='btn-primary absolute px-3 py-1 right-0 mr-2'>Change</button>
    return (
        <div>
            <h3 className='font-bold mb-2'>Solver</h3>
            <div className='bg-neutral-900 p-2 rounded w-full flex flex-row gap-1 relative'>
                <Image src="/avatar.svg" alt="avater" width={2} height={2} className='w-8 h-8 rounded-full bg-neutral-300 mr-2 text-color cursor-pointer'></Image>
                <div>Jakub Galeta</div>
                
            </div>
        </div>
    )
}