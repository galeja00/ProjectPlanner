"use client"

import Image from "next/image"
import { DragEventHandler, useReducer, useState, DragEvent, useRef, ChangeEvent, useEffect, ButtonHTMLAttributes } from "react"
import DropImage from "../components/drop-image";
import { User } from "@prisma/client";
import { ButtonItems, ButtonList, DeleleteDialog, DialogClose } from "../components/other";
import { useRouter } from 'next/navigation'
import { signOut } from "next-auth/react";
import { FormItem, SubmitButton } from "../components/form";
import { pathToImages } from "@/config";

enum UpdateTypes {
    Name = "Name",
    Email = "Email"
}


export default function Profile() {
    const [isDrop, toggleDrop] = useReducer(isDrop => !isDrop, false);
    const [user, setUser] = useState<User | null>(null);
    const [isPassw, togglePassw] = useReducer(isPassw => !isPassw, false);
    const [isDell, toggleDell] = useReducer(isDell => !isDell, false);
    const router = useRouter(); 

    async function fetchProfile() {
        try {
            const res = await fetch("/api/users/acc", {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            console.log(data);
            setUser(data.user);
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchProfile();
    },[])

    async function handleDelete() {
        try {
            signOut();
            const res = await fetch("/api/users/acc/delete", {
                method: "POST"
            })
            if (res.ok) {
                router.push("/auth/signin");
                return;
            }
            router.push("/error");
        }
        catch (error) {
            console.error(error);
        }
    }

    async function handleUpdateAcc(upUser : User, type : UpdateTypes) {
        try {
            const res = await fetch("api/users/acc/update", {
                method: "POST",
                body: JSON.stringify({
                    user: upUser,
                    type: type
                })
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            setUser(data.user);
        }
        catch (error) {
            console.error(error);
        }
    }

    function updateImg(img : string) {
        if (user) {
            user.image = img;
            setUser(user);
        }
    }

    if(!user) {
        return (
            <h1>Loading...</h1>
        )
    }

    const date = new Date(user.createdAt);
    let formattedDate = "";
    const day = date.getDate();
    const month = date.getMonth() + 1; // Měsíce jsou indexovány od nuly, takže přidáme 1
    const year = date.getFullYear();
    formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;

    const buttons : ButtonItems[] = [];
    buttons.push({name: "Change Password", onClick: togglePassw, type: "primary"});
    buttons.push({name: "Delete", onClick: toggleDell, type: "destructive"});
    
    let image : string = "/avatar.svg";
    if (user.image) {
        image = `/uploads/user/${user.image}`;
    }
    return ( 
        <>
            {
                isDrop ? 
                    <DropImage closeDrop={toggleDrop} updateImg={updateImg}/>
                    :
                    <></>
            }
            {
                isDell ? 
                    <DeleleteDialog message="Do you realy wont to delete your account?" onClose={toggleDell} onConfirm={handleDelete}/>
                    :
                    <></>
            }
            {
                isPassw ? 
                    <PasswordChange onClose={togglePassw}/>
                    :
                    <></>
            }
            <div className="flex w-2/4 flex-col m-auto py-14 space-y-4" >
                <section className="bg-neutral-950 rounded flex gap-16 p-4">
                    <Image src={image} onClick={toggleDrop} alt={""} height={300} width={300} className="rounded-full bg-neutral-300 hover:bg-neutral-500 hover:outline  w-32 h-32 cursor-pointer"></Image>
                    <div className="flex flex-col gap-4">
                        <Name user={user}/>
                        <Email user={user}/>
                        <p>{formattedDate}</p>
                    </div>
                </section>
                <Id user={user}/>
                <section>
                    <ButtonList items={buttons}/>
                </section>
            </div> 
        </>
    )
}

function Name({ user } : { user : User }) {
    return ( 
        <h1 className="text-xl font-bold">{user.name} {user.surname}</h1> 
    )
}

function Email({ user } : { user : User }) {
    return (
        <p>{user?.email}</p>  
    )
}

function Id({ user } : { user : User }) {
    return (
        <section className="bg-neutral-950 rounded p-4">
            <h2 className="font-bold mb-4">Invite Id</h2>
            <p>{user.id}</p>
        </section>
    )
}

function PasswordChange({ onClose } : { onClose : () => void}) {
    const [msg, setMsg] = useState<string>("");
    const [isCorrect, toggleCorrect] = useReducer(isCorrect => !isCorrect, true);

    async function handleChangePassword() {
        try {

        }
        catch (error) {
            console.error(error);
        }
    }

    return ( 
        <dialog className='absolute z-50 flex bg-neutral-900 bg-opacity-60 left-0 top-0 w-full h-full text-neutral-100 justify-center items-center'>
            <div className='bg-neutral-950 rounded w-fit h-fit overflow-hidden relative p-8 '>
                <DialogClose handleClose={onClose}/>
                <h2 className="font-bold text-xl mb-8">Change password</h2>
                <form className="flex flex-col gap-4 m-0 w-96">
                    <FormItem item="Password" type="password" name="password" correct={isCorrect}/>
                    <FormItem item="Repeat Password" type="password" name="password" correct={isCorrect}/>
                    <SubmitButton/>
                    <p>{msg}</p>
                </form>
            </div>
        </dialog>
    )
}