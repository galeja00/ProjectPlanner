"use client"

import Image from "next/image"
import { useReducer, useState, useEffect, KeyboardEvent, FormEvent } from "react"
import DropImage from "../components/drop-image";
import { User } from "@prisma/client";
import {DeleleteDialog, EditTextButton } from "../components/other";
import { useRouter } from 'next/navigation'
import { signOut } from "next-auth/react";
import { FormItem, SubmitButton } from "../components/form";
import { Dialog, DialogClose } from "../components/dialog";
import { ErrorState, useError } from "../components/error-handler";
import { InitialLoader } from "../components/other-client";
import { ArrayButtons, Button, ButtonItems, ButtonList, ButtonType, Lighteness } from "../components/buttons";

enum UpdateTypes {
    Name = "Name",
    Email = "Email"
}


export default function Profile() {
    const [isDrop, toggleDrop] = useReducer(isDrop => !isDrop, false);
    const [user, setUser] = useState<User | null>(null);
    const [isPassw, togglePassw] = useReducer(isPassw => !isPassw, false);
    const [isDell, toggleDell] = useReducer(isDell => !isDell, false);
    const { submitError } = useError();
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
            submitError( error, fetchProfile);
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
            submitError( error, handleDelete);
        }
    }

    async function handleUpdateAcc(upUser : User) {
        try {
            const res = await fetch("api/users/acc/update", {
                method: "POST",
                body: JSON.stringify({
                    user: upUser,
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
            submitError(error, () => handleUpdateAcc(upUser));
        }
    }


    async function fetchImage(image : File) {
        try {
            const formData = new FormData();
            formData.append('image', image);
            const res = await fetch("/api/users/acc/image", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                if (user) {
                    user.image = data.img;
                    setUser(user);
                    toggleDrop();
                }
                return;
            }
            throw new Error(data.error);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => fetchImage(image));
        }
    }

    if(!user) {
        return (
            <div className="flex w-2/4 flex-col m-auto py-14 space-y-8" >
                <InitialLoader/>
            </div>
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
            { isDrop && <DropImage closeDrop={toggleDrop} updateImg={fetchImage}/>}
            { isDell && <DeleleteDialog message="Do you realy wont to delete your account?" onClose={toggleDell} onConfirm={handleDelete}/>}
            { isPassw && <PasswordChange onClose={togglePassw}/> }
            <div className="flex w-2/4 flex-col m-auto py-14 space-y-8" >
                <section className="bg-neutral-200 rounded flex gap-16 p-4">
                    <Image src={image} onClick={toggleDrop} alt={""} height={300} width={300} className="rounded-full bg-neutral-300 hover:outline-violet-600 hover: w-32 h-32 cursor-pointer"></Image>
                    <div className="flex flex-col gap-4">
                        <Name user={user} handleUpdate={handleUpdateAcc}/>
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

function Name({ user, handleUpdate } : { user : User, handleUpdate : (user : User) => void }) {
    const [ name, setName ] = useState<string>(user.name);
    const [ surname, setSurname ] = useState<string>(user.surname);
    const [ edit, toggleEdit ] = useReducer(edit => !edit, false);

    function handleSubmit() {
        user.name = name;
        user.surname = surname;
        handleUpdate(user);
        toggleEdit();
    }

    function handleKeyDown(event : KeyboardEvent<HTMLInputElement>) {
        const inputValue = event.currentTarget.value;
        if (event.key === 'Enter') {
            if (inputValue.length > 0) {
                handleSubmit();
                toggleEdit();
            }
        }
    }

    const buttons : Button[] = [
        { onClick: handleSubmit, img: "/check.svg", type: ButtonType.Creative, size: 8, lightness: Lighteness.Bright, title: "Create"},
        { onClick: toggleEdit, img: "/x.svg", type: ButtonType.Destructive, size: 8, lightness: Lighteness.Bright, title: "End" }
    ]


    return ( 
        <div className="flex gap-2">
            {
                edit ? 
                    <div className="flex gap-2">
                        <input type="text" defaultValue={user.name} onKeyDown={handleKeyDown} onChange={(event) => setName(event.currentTarget.value)} className="border-neutral-900 bg-neutral-200 outline-none border-b text-xl font-bold w-3/6"></input>
                        <input type="text" defaultValue={user.surname} onKeyDown={handleKeyDown} onChange={(event) => setSurname(event.currentTarget.value)} className="border-neutral-900 bg-neutral-200 outline-none border-b text-xl font-bold w-3/6"></input>
                        <ArrayButtons buttons={buttons} gap={2}/>
                    </div>
                    :
                    <h1 className="text-xl font-bold">{user.name} {user.surname}</h1> 
            }
            <EditTextButton onClick={toggleEdit}/>
        </div> 
    )
}

function Email({ user } : { user : User }) {
    return (
        <div className="flex gap-2">
            <p>{user.email}</p> 
        </div> 
    )
}

function Id({ user } : { user : User }) {
    return (
        <section className="bg-neutral-200 rounded p-4">
            <h2 className="font-bold mb-4">Invite Id</h2>
            <p>{user.id}</p>
        </section>
    )
}

function PasswordChange({ onClose } : { onClose : () => void}) {
    const [msg, setMsg] = useState<string>("");
    const [isCorrect, toggleCorrect] = useReducer(isCorrect => !isCorrect, true);

    async function handleChangePassword(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const password = formData.get("password");
        const repeatpassword = formData.get("repeatpassword");
        try {
            console.log(password, repeatpassword);
            const res = await fetch("/api/auth/password/change" , {
                method: "POST", 
                body: JSON.stringify({
                    password: password,
                    repeatPassword: repeatpassword
                })
            })
            const data = await res.json();
            if (!res.ok) {
                toggleCorrect();
                setMsg(data.error);
                return;
            }
            setMsg(data.message)
        }
        catch (error) {
            console.error(error);
        }
    }

    return ( 
        <Dialog>
            <div className='bg-neutral-200 rounded w-fit h-fit overflow-hidden relative p-8 '>
                <DialogClose handleClose={onClose}/>
                <h2 className="font-bold text-xl mb-8">Change password</h2>
                <form onSubmit={handleChangePassword} className="flex flex-col gap-4 m-0 w-96">
                    <FormItem item="Password" type="password" name="password" correct={isCorrect}/>
                    <FormItem item="Repeat Password" type="password" name="repeatpassword" correct={isCorrect}/>
                    <SubmitButton text="Submit"/>
                    <p className={`m-auto ${isCorrect ? "text-green-600" : "text-red-600"}`}>{msg}</p>
                </form>
            </div>
        </Dialog>
    )
}