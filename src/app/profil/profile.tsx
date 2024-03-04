"use client"

import Image from "next/image"
import { DragEventHandler, useReducer, useState, DragEvent, useRef, ChangeEvent } from "react"

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

    async function updateImage(image : File) {
        console.log(image);
        toggleDrop();
    }

    function handleClickAvatar() {
        toggleDrop();
    }

    return ( 
        <>
            {
                isDrop ? 
                    <DropImage updateImage={updateImage}/>
                    :
                    <></>
            }
            <div className="flex w-2/4 flex-col m-auto py-14" >
                <section className="bg-neutral-950 rounded flex gap-16 p-8 mb-8">
                    <Image src={"/avatar.svg"} onClick={handleClickAvatar} alt={""} height={50} width={50} className="rounded-full bg-neutral-300  w-32 h-32 cursor-pointer"></Image>
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

function DropImage({ updateImage } : { updateImage : (image : File) => void}) {
    const [file, setFile] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isOver, toggleOver] = useReducer(isOver => !isOver ,false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleDragOver(e : DragEvent) {
        e.preventDefault();
        if (!isOver) {
            toggleOver();
        }
        
    }

    function submitFile(file : File) {
        if (file.type == "image/png" || file.type == "image/jpeg") {
            updateImage(file);
        } 
        else {
            setErrorMsg("Unsupported file format");
        }
    }

    function handleDrop(e : DragEvent) {
        e.preventDefault();
        console.log(e.dataTransfer)
        setFile(e.dataTransfer.files[0]);
        if (file) {
            submitFile(file);
        }
    }

    function handleDragExit(e : DragEvent) {
        e.preventDefault();
        if (isOver) {
            toggleOver();
        }
    }

    function handleSelect(e : ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if (e.target.files) {
            setFile(e.target.files[0]);
            if (file) {
                submitFile(file);
            }
        }
    }

    return (
        <div className="w-full h-full bg-neutral-950 bg-opacity-80 absolute z-50 flex justify-center items-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragExit}
            onDrop={handleDrop}
        >
            <div className={` w-64 h-64 ${isOver ? "bg-violet-600" : "bg-neutral-900"} rounded flex justify-center items-center p-2`}>
                <div className="w-full h-full border border-dashed rounded flex flex-col justify-center items-center">
                    <div>Drop Image <div>Or</div></div>
                    <input type="file" title="" accept="image/png, image/jpeg" hidden ref={inputRef}
                        onChange={handleSelect}
                    />
                    <button onClick={() => inputRef.current?.click()} className="btn-primary">Select Image</button>
                </div>
                <p className="text-red-500">{errorMsg}</p>
            </div>
        </div>
    )
}