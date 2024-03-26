"use client"


import { useEffect, useReducer, useState, KeyboardEvent, ChangeEvent } from "react";
import Image from 'next/image' 
import { Issue, Tag, Task, Ranking } from "@prisma/client";

export function Name({name, updateName} : {name : string, updateName : (name : string) => void}) {
    const [eName, setName] = useState<string>(name);
    const [isEditing, toggleEdit] = useReducer((isEditing) => !isEditing, false);

    function submitName(val : string) {
        setName(val);
        updateName(val);
    }

    function changeEdit() {
        toggleEdit();
    }
    
    function handleKeyDown(event : KeyboardEvent<HTMLInputElement>) {
        //event.preventDefault();
        const inputValue = event.currentTarget.value;
        if (event.key === 'Enter') {
            if (inputValue.length > 0) {
                submitName(inputValue);
                toggleEdit();
            }
        }
    }
    return (
        <div className="flex mb-4 gap-4">
            {
                isEditing ? 
                    <>
                        <input type="text" defaultValue={eName} onKeyDown={handleKeyDown} className="bg-neutral-950 outline-none border-b text-xl font-bold w-5/6"></input>
                    </>
                    :
                    <>
                        <h3 className='text-xl font-bold'>{eName}</h3>
                    </>
            }
            <button onClick={changeEdit} title="Edit Name">
                <Image src={"/pencil.svg"} alt={"custom name"} height={20} width={20}/>
            </button>
        </div>
    )
}

