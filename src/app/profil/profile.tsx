"use client"

import Image from "next/image"
import { DragEventHandler, useReducer, useState, DragEvent, useRef, ChangeEvent } from "react"
import DropImage from "../projects/[id]/components/drop-image";

export default function Profile() {
    const [isDrop, toggleDrop] = useReducer(isDrop => !isDrop, false);
    async function fetchProfile() {
        try {
            const res = await fetch("/api/users/acc", {
                method: "GET"
            })
        }
        catch (error) {

        }
    }

 
    return ( 
        <>
            {
                isDrop ? 
                    <DropImage closeDrop={toggleDrop}/>
                    :
                    <></>
            }
            <div className="flex w-2/4 flex-col m-auto py-14" >
                <section className="bg-neutral-950 rounded flex gap-16 p-8 mb-8">
                    <Image src={"/avatar.svg"} onClick={toggleDrop} alt={""} height={50} width={50} className="rounded-full bg-neutral-300  w-32 h-32 cursor-pointer"></Image>
                    <div className="flex flex-col gap-4">
                        <h1 className="text-xl font-bold">XXXX XXXX</h1> 
                        <p>xxxxxx@gmail.cz</p>  
                    </div>
                </section>
                <section className="bg-neutral-950 rounded p-8 mb-8">
                    <h2 className="font-bold mb-4">Invite Id</h2>
                    <p>clsyqdehw0000huowt4mkzjdy</p>
                </section>
                <section className="bg-neutral-950 rounded p-8 mb-8">
                    <h2 className="font-bold mb-4">Password</h2>
                    <p>***********************</p>
                </section>
            </div> 
        </>
    )
}

