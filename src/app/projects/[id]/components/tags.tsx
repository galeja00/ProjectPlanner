"use client"

import { useReducer, useState, ChangeEvent } from "react";
import Image from 'next/image' 
import { Task, Ranking } from "@prisma/client";
import { DateTime } from "next-auth/providers/kakao";

// not implemented 
// future function in app
// for seraching and filtering in teams and tasks
/*
type Tag = {
    id : string,
    name : string,
    color : string,
    taskId : string | null,
    teamId : string | null,
    createdAt : Date
}


// TODO: submit name to upper component
export function TagList({tags, projectId} : {tags : Tag[], projectId : string}) {
    const [acTags, setTags] = useState<Tag[]>([]);
    const [creating, toggle] = useReducer(creating => !creating, false);
   

    async function handleDeleteTag(delTag : Tag) {
        try {
            const res = await fetch(`/api/${projectId}/task/tag/delete`, {
                method: "POST",
                body: JSON.stringify({
                    id: delTag.id
                })
            })

            const date = await res.json(); 

            const newTags : Tag[] = [];
            for (const tag of acTags) {
                if (tag.id != delTag.id) {
                    newTags.push(tag);
                }
            }
            setTags(newTags);
        }
        catch (error) {
            console.error(error);
        }
    }

    async function handleCreateTag(name : string, color : string) {
        try {
            const res = await fetch(`/api/${projectId}/task/tag/create`, {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    color: color
                })
            })
            const id = Math.random().toString();
            const newTags : Tag[] = acTags;
            newTags.push({
                id: id, taskId: "asdads", name: name, color: color, teamId: null,
                createdAt: new Date()
            });
            setTags(newTags);
            toggle();
        }
        catch {
            console.error();
        }
    }

    return (
        <div className="flex gap-1 h-8">
            <ul className='flex gap-2 rounded-lg '>
                {
                    acTags.map((tag) => (
                        <TagElement key={tag.id} tag={tag} handleDeleteTag={handleDeleteTag}/>
                    ))
                }
            </ul>
            {creating && <TagCreator handleCreateTag={handleCreateTag}/>}
            <button title="Create Tag" onClick={toggle}>
                <Image src={"/plus.svg"} alt={"create tag"} height={20} width={20}/>
            </button>
        </div>
        
    )
}


function TagCreator({ handleCreateTag } : { handleCreateTag : (name : string, color : string) => void}) {
    const [color, setColor] = useState<string>("#FFFFFF");
    const [name, setName] = useState<string>("");

    function handleColorChange(event: ChangeEvent<HTMLInputElement>) {
        setColor(event.currentTarget.value);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.currentTarget.value);
    }

    return ( 
        <div className="flex gap-2 items-center px-3 py-1 bg-neutral-100 rounded">
            <input type="text" className="bg-neutral-100 outline-none border-b w-32 text-sm h-5 " id="tagName" onChange={handleInputChange}></input>
            <input type="color" value={color} onChange={handleColorChange} className="w-5 h-5 bg-neutral-200 rounded outline-none cursor-pointer"></input>
            <button onClick={() => handleCreateTag(name, color)} className="w-fit h-fit"><Image src={"/check.svg"} alt="submit" height={40} width={40} className="w-5 h-5 rounded bg-neutral-950"></Image></button>
        </div>
    )
}

function TagElement({ tag, handleDeleteTag } : { tag : Tag, handleDeleteTag : (tag : Tag) => void }) {
    const opacity = 0.6; // Průhlednost v rozmezí 0 až 1 (0 - 100%)
    const rgbaColor = `${tag.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`; //Vytvoří hexadecimal zápis pro RGBA

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
*/    