"use client"

import { CreateButton } from '@/app/components/buttons';
import { useReducer, useState, KeyboardEvent,  ChangeEvent } from 'react'

export function Creator({ what, handleCreate } : {what : string, handleCreate : (name : string) => void}) {
    const [ isCreating, toggleCreating ] = useReducer(isCreating => !isCreating, false);
    const [ name, setName ] = useState<string>("");

    function handleKeyDown(event :  KeyboardEvent<HTMLInputElement>) {
        const inputValue = event.currentTarget.value;
        if (event.key === 'Enter') {
            if (inputValue.length > 0) {
                handleCreate(inputValue);
                toggleCreating();
            }
        } else if (event.key === 'Escape') {
            toggleCreating();
        }
    }

    function handleChange(event : ChangeEvent<HTMLInputElement>) {
        setName(event.currentTarget.value);
    }

    function create(name : string) {
        handleCreate(name); 
        toggleCreating();
    }


    return (
        <div className='h-fit p-2'>
            { isCreating ? 
                <div className='bg-neutral-950 rounded  w-fit space-x-4 flex flex-row'>
                    <input type="text" className="input-primary h-8 w-48" onChange={handleChange} onKeyDown={handleKeyDown}/>
                    <div className='space-x-2 h-full flex items-center'>
                        <button onClick={() => create(name)} className='bg-neutral-900 w-max rounded hover:outline hover:outline-1 hover:outline-green-600'>
                            <img src="/check.svg" className='w-8 h-8 hover:bg-green-600 rounded hover:bg-opacity-40 p-1 '/>
                        </button>
                        <button onClick={toggleCreating} className='bg-neutral-900 w-max rounded hover:outline hover:outline-1 hover:outline-red-600'>
                            <img src="/x.svg" className='w-8 h-8 hover:bg-red-600 rounded hover:bg-opacity-40 p-1'/>
                        </button>
                    </div>
                    
                </div>
                :
                <CreateButton text={what} onClick={toggleCreating}/>
            }
        </div>
    )
}


export function CreatorOfTask({ createTask, endCreate } : { createTask: (text : string) => void, endCreate : () => void }) {
    const [ name, setName ] = useState<string>("");
    function handleKeyDown(event :  KeyboardEvent<HTMLInputElement>) {
        const inputValue = event.currentTarget.value;
        if (event.key === 'Enter') {
            if (inputValue.length > 0) {
                createTask(inputValue);
            }
        } else if (event.key === 'Escape') {
            endCreate();
        }
    }

    function handleChange(event : ChangeEvent<HTMLInputElement>) {
        setName(event.currentTarget.value);
    }

    function create() {
        createTask(name);
        endCreate();
    }

    return (
        <li className="rounded bg-neutral-900 p-2 flex gap-2 ">
            <input type="text" className="bg-neutral-900 outline-none border-b w-full" id="name" onKeyDown={handleKeyDown} onChange={handleChange}></input>
            <div className='space-x-2 h-full flex items-center'>
                <button onClick={() => create()} className='bg-neutral-950 rounded hover:outline hover:outline-1 hover:outline-green-600'>
                    <img src="/check.svg" className='w-8 h-8 hover:bg-green-600 rounded hover:bg-opacity-40 p-1 '/>
                </button>
                <button onClick={endCreate} className='bg-neutral-950 rounded hover:outline hover:outline-1 hover:outline-red-600'>
                    <img src="/x.svg" className='w-8 h-8 hover:bg-red-600 rounded hover:bg-opacity-40 p-1'/>
                </button>
            </div>
        </li>
    )
}