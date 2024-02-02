'use client'
import { useReducer, useState, useEffect } from 'react'
import { signOut } from "next-auth/react"
import Image from 'next/image'
import Link from 'next/link'
import { DateTime } from 'next-auth/providers/kakao'

export default function UserInfo() {
    const [menu, setMenu] = useState<boolean>(false);
    const [displaydNotif, toggleNotif] = useReducer((displaydNotif) => !displaydNotif, false); 
    function toggleUserMenu() {
        if (menu) {
            setMenu(false);
        } else {
            setMenu(true);
        }
    }

    return (
        <>
            <Image onClick={toggleNotif} src="/bell.svg" alt="notification" width={8} height={8} className='w-6 h-6 cursor-pointer rounded-full hover:bg-neutral-900 '></Image>
            { displaydNotif ? <Notifications/> : <></> }
            <Image onClick={toggleUserMenu} src="/avatar.svg" alt="avater" width={2} height={2} className='w-8 h-8 rounded-full bg-neutral-300 mr-5 text-color cursor-pointer'></Image>
            { menu ? <UserMenu/> : <></> }
        </>
        
    )
}

function UserMenu() {
    return (
        <ul className='absolute flex flex-col p-4 bg-neutral-950 right-0 top-10 rounded gap-1'>
            <li><Link href="" className='hover:text-violet-500 hover:border-b hover:border-violet-500 ease-in-out'>Your profile</Link></li>
            <li><button onClick={() => signOut()} className='hover:text-violet-500 hover:border-b hover:border-violet-500 ease-in-out'>Sign Out</button></li>
        </ul>
    )
}

type Notification = {
    type : string,
    name : string,
    text : string,
    image : string,
    time : DateTime
}

function Notifications() {
    const [notifs, setNotifs] = useState<Notification[]>([]); 
    
    async function fetchNotifications() {
        let id = 10;
        try {
            const res = await fetch(`/api/users/${id}/notifications`, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            } 

        }
        catch (error) {

        }
    }

    useEffect(() => {
        fetchNotifications();
    }, [])

    return (
        <div className='absolute flex flex-col bg-neutral-950 right-0 top-10 rounded gap-1 p-2 w-72'>
            <h4>Notifiactions</h4>
            <ul >
                {
                    notifs.map((notif) => (
                        <></>
                    ))
                }
            </ul>
        </div>
    )
}

function NotificationsItem() {
    return (
        <li className='bg-neural-900'>
            <Image src={''} alt={''} width={30} height={30} className="bg-neutral-50 rounded h-fit block mt-auto mb-auto"></Image>
            <div>
                <h5>name</h5>
                <div>7h</div>
            </div>
            
            <p>text</p>
        </li>
    )
} 