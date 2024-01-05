'use client'
import { useState } from 'react'
import { signOut } from "next-auth/react"
import Image from 'next/image'
import Link from 'next/link'

export default function UserInfo() : JSX.Element {
    const [menu, setMenu] = useState<boolean>(false);
    function HandleClick() {
        if (menu) {
            setMenu(false);
        } else {
            setMenu(true);
        }
    }

    function displayNotif() {

    }

    return (
        <>
        <Image onClick={displayNotif} src="/bell.svg" alt="notification" width={8} height={8} className='w-6 h-6 cursor-pointer rounded-full hover:bg-neutral-900 '></Image>
        <Image onClick={HandleClick} src="/avatar.svg" alt="avater" width={2} height={2} className='w-8 h-8 rounded-full bg-neutral-300 mr-5 text-color cursor-pointer'></Image>
        { menu ? (
            <UserMenu/>
        ) : (
            <></>
        )}
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