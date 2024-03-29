'use client'
import { useReducer, useState, useEffect } from 'react'
import { signOut } from "next-auth/react"
import Image from 'next/image'
import Link from 'next/link'
import { DateTime } from 'next-auth/providers/kakao'
import { useRouter } from 'next/navigation'

export default function UserInfo() {
    const [userImg, setImg] = useState<string>("/avatar.svg");
    const [menu, setMenu] = useState<boolean>(false);

    async function fetchUser() {
        try {
            const res = await fetch("/api/users/acc/image", {
                method: "GET"
            });
            const data = await res.json();
            if (!res.ok) {
                console.error(data.error);
                fetchUser();
            }
            if (data.image) {
                setImg(`/uploads/user/${data.image}`);
            }
            
        }
        catch (error) {
            console.log(error);
        }
    }


    function toggleUserMenu() {
        if (menu) {
            setMenu(false);
        } else {
            setMenu(true);
        }
    }

    useEffect(() => {fetchUser()}, []);

    

    return (
        <>
            <NotificationIcon/>
            <Image onClick={toggleUserMenu} src={userImg} alt="avater" width={30} height={30} className='w-8 h-8 rounded-full bg-neutral-300 mr-5 text-color cursor-pointer'></Image>
            { menu ? <UserMenu/> : <></> }
        </>
        
    )
}

function UserMenu() {
    const router = useRouter();
    function handleSignOut() {
        signOut();
        router.push("/auth/signin");
        return;
    }
    return (
        <ul className='absolute z-50 flex flex-col p-4 bg-neutral-950 right-0 top-10 rounded gap-1 shadow shadow-neutral-900'>
            <li><Link href="/profil" className='hover:text-violet-500 hover:border-b hover:border-violet-500 ease-in-out'>Your profile</Link></li>
            <li><button onClick={handleSignOut} className='hover:text-red-600 hover:border-b text-red-500 hover:border-red-600 ease-in-out'>Sign Out</button></li>
        </ul>
    )
}

function NotificationIcon() {
    const [ring, toggle] = useReducer((ring) => !ring,true);
    const [count, setCount] = useState<number>(0);

    async function fetchInfo() {
        try {
            const res = await fetch(`/api/users/notifications/count`, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            if (data.count > 0) {
                if (!ring) {
                    toggle();
                }
                setCount(data.count);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    useEffect(() => { fetchInfo();
    }, [])

    return (
        <Link href="/notifications" className='relative'>
            <Image src="/bell.svg" alt="notification" width={8} height={8} className='w-7 h-7 cursor-pointer rounded-full hover:bg-neutral-900 '></Image>
            <div className='absolute rounded-full right-0 top-0 bg-red-600 w-4 h-4 text-xs justify-center' style={ {display: ring ? "flex" : "none"}}>{count}</div> 
        </Link>
    )
}
