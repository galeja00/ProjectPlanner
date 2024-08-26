'use client'
import { useReducer, useState, useEffect, useRef } from 'react'
import { signOut } from "next-auth/react"
import Image from 'next/image'
import Link from 'next/link'
import { DateTime } from 'next-auth/providers/kakao'
import { useRouter } from 'next/navigation'

// user info in right top corner of navbar
export default function UserInfo() {
    const [userImg, setImg] = useState<string>("/avatar.svg");

    async function fetchUser() {
        try {
            const res = await fetch("/api/users/acc/image", {
                method: "GET"
            });
            const data = await res.json();
            if (!res.ok) {
                console.error(data.message);
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

    useEffect(() => {fetchUser()}, []);

    return (
        <>
            <NotificationIcon/>
            <UserMenu userImg={userImg}/> 
        </>
        
    )
}

// menu fo user where he want to go
function UserMenu({ userImg } : { userImg : string }) {
    const router = useRouter();
    const [ isMenu, setMenu ] = useState<boolean>(false); 
    const menuRef = useRef<HTMLUListElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
  
    function isClickedOutside(event: MouseEvent) {
        const target = event.target as Node;
        if (menuRef.current && buttonRef.current) {
            return !menuRef.current.contains(target) && !buttonRef.current.contains(target);
        }
      };
    
    function handleClickOutside(event: MouseEvent) {
        if (isClickedOutside(event)) {
            setMenu(false);
        }
    }
  
    function handleClickButton(event: React.MouseEvent) {
        setMenu(isMenu => !isMenu); 
    }

    function handleSignOut() {
        signOut();
        router.push("/auth/signin");
    }
  
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
      } ;
    }, [isMenu]);

    
    return (
        <>
            <button ref={buttonRef} onClick={handleClickButton}>
                <Image src={userImg} alt="avater" width={30} height={30} className='w-8 h-8 rounded-full bg-neutral-300 mr-5 text-color cursor-pointer object-cover'></Image>
            </button>
            { isMenu && 
                <ul ref={menuRef} className='absolute z-20 flex flex-col p-4 bg-neutral-200 right-0  top-10 border border-neutral-700  gap-1 shadow shadow-neutral-100'>
                    <li><Link href="/profil" onClick={() => setMenu(false)} className='hover:text-violet-600 hover:border-b hover:border-violet-600 ease-in-out'>Your profile</Link></li>
                    <li><button onClick={handleSignOut} className='hover:text-red-600 hover:border-b text-red-500 hover:border-red-600 ease-in-out'>Sign Out</button></li>
                </ul> 
            }
        </>
    )
}

// inform if user have some notifications
// in same tame easy to navigate to notifications
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
            console.error(error);
        }
    }


    useEffect(() => {
        const interval = setInterval(() => {
            fetchInfo(); // Call fo info
        }, 50000); 

        // Clean Interval
        return () => clearInterval(interval);
    }, []);

    return (
        <Link href="/notifications" className='relative' title='Notifications'>
            <Image src="/bell.svg" alt="notification" width={8} height={8} className='w-7 h-7 cursor-pointer'></Image>
            <div className='absolute rounded-full right-0 top-0 bg-red-600 w-4 h-4 text-xs justify-center' style={ {display: ring ? "flex" : "none"}}>{count}</div> 
        </Link>
    )
}
