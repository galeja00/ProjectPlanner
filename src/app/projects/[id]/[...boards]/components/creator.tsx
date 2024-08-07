"use client"

import { ButtonSideText, Lighteness } from '@/app/components/buttons';
import { useReducer, useState, KeyboardEvent,  ChangeEvent } from 'react'

export function Creator({ what, handleCreate, lightness, big } : {what : string, handleCreate : (name : string) => void, lightness : Lighteness, big? : boolean }) {
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
        setName(""); 
    }

    const bgColor = lightness == Lighteness.Bright ? "bg-neutral-100" : "bg-neutral-200";
    const buttonColor = lightness == Lighteness.Bright ? "bg-neutral-200" : "bg-neutral-100";
    
    return (
        <div className='h-fit'>
            { isCreating ? 
                <div className={`${bgColor} rounded p-2  w-fit space-x-4 flex flex-row`}>
                    <input type="text" className={`input-primary px-1 h-6 w-48 ${buttonColor}`} onChange={handleChange} onKeyDown={handleKeyDown}/>
                    <div className='space-x-2 h-full flex items-center'>
                        <button onClick={() => create(name)} className={`${buttonColor} w-max rounded hover:outline hover:outline-1 hover:outline-green-600`}>
                            <img src="/check.svg" className='w-6 h-6 hover:bg-green-600 rounded hover:bg-opacity-40'/>
                        </button>
                        <button onClick={toggleCreating} className={`${buttonColor} w-max rounded hover:outline hover:outline-1 hover:outline-red-600`}>
                            <img src="/x.svg" className='w-6 h-6 hover:bg-red-600 rounded hover:bg-opacity-40'/>
                        </button>
                    </div>
                    
                </div>
                :
                <ButtonSideText text={what} image={"/plus.svg"} onClick={toggleCreating} lightness={lightness} big={big}/>
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
                setName("");
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
        setName(""); 
    }

    return (
        <li className="rounded bg-neutral-100 p-2 flex gap-2">
            <input type="text" className="bg-neutral-100 outline-none border-b border-neutral-600 w-full" id="name" onKeyDown={handleKeyDown} onChange={handleChange}></input>
            <div className='space-x-2 h-full flex items-center'>
                <button onClick={() => create()} className='bg-neutral-200 rounded hover:outline hover:outline-1 hover:outline-green-600'>
                    <img src="/check.svg" className='w-6 h-6 hover:bg-green-200 rounded hover:bg-opacity-40'/>
                </button>
                <button onClick={endCreate} className='bg-neutral-200 rounded hover:outline hover:outline-1 hover:outline-red-600'>
                    <img src="/x.svg" className='w-6 h-6 hover:bg-red-600 rounded hover:bg-opacity-40'/>
                </button>
            </div>
        </li>
    )
}