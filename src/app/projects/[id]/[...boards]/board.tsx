'use client'
import Image from 'next/image' 
import { useReducer, useState } from 'react'

export default function Board() {
    return (
        <section className="flex gap-2 w-full">
            <TaskColumn name="Todo"></TaskColumn>
            <TaskColumn name="InWork"></TaskColumn>
            <TaskColumn name="Done"></TaskColumn>
            <AddTaskColumn></AddTaskColumn>
        </section>
    )
}

function TaskColumn({ name } : { name : string}) {
    return (
        <section className="bg-neutral-950 rounded w-80 h-fit">
            <div className="p-2 border-b border-neutral-400">
                <h2 className="">{name}</h2>
            </div>
            <div className="p-2">
                <ul className="flex flex-col gap-2 mb-2">
                    <TaskItem name="node1"/>
                    <TaskItem name="node2"/>
                </ul>
                <AddTaskButton/>
            </div>
        </section>
    )
}

function TaskItem({ name } : { name : string}) {
    return (
        <li className="rounded bg-neutral-900 p-2 flex flex-col gap-2">
            <div className='flex w-full items-center justify-between'>
                <Name name={name}/>
                <More/>
            </div>
            <TagList/>
            <div className='flex flex-row-reverse'>
                <Solvers/>
            </div>
        </li>
    )
}

function TagList() {
    // TODO: Tags and ags type
    const [tags, setTags] = useState();
    const [adding, toggle] = useReducer(adding => !adding, false);

    function addTag() {
        toggle();
    }

    return (
        <div className='flex'>
            <ul>
            </ul>
            { adding ?
                <form>
                    <input></input>
                    <button></button>
                </form>
                :
                <button onClick={addTag}><Image src="/plus.svg" width={20} height={20} alt="add"></Image></button>
            }
               
        </div>
    )
}

function Tag({ name, type } : { name : string , type : string}) {
    return (
        <li>{name}</li>
    )
}


function AddTaskButton() {
    return (
        <button className='flex items-center gap-2'>
            <Image src="/plus.svg" alt="avatar" width={2} height={2} className='w-7 h-7 rounded bg-neutral-900 cursor-pointer'></Image>
            <p className='text-neutral-400 text-sm'>Create new task</p>
        </button>
    )
}

function Solvers() {
    return (
        <div>
            <Image src="/avatar.svg" alt="avatar" width={2} height={2} className='w-7 h-7 rounded-full bg-neutral-300 cursor-pointer'></Image>
        </div>    
    )
}

function AddTaskColumn() {
    return (
        <button>
            <Image src="/plus.svg" alt="avatar" width={2} height={2} className='w-7 h-full rounded bg-neutral-950 cursor-pointer'></Image>
        </button>
    )
}

function Name({ name } : { name : string}) {
    return (
        <div className='flex gap-2'>
            <h3>{name}</h3>
            <button><Image src="/pencil.svg" alt="more" width={2} height={2} className='w-5 h-5 rounded-full cursor-pointer'></Image></button>
        </div>
    )
}

function More() {
    return (
        <button>
            <Image src="/more.svg" alt="more" width={2} height={2} className='w-5 h-5 rounded-full cursor-pointer'></Image>
        </button>
        
    )
}

