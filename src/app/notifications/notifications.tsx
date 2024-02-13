'use client'

import { useEffect, useState } from "react";
import Image from 'next/image' 
import { DateTime } from "next-auth/providers/kakao"

type Notification = {
    id : string,
    projectId : string,
    type : string,
    creatAt : Date,
    displayd : boolean
}

export default function NotifiactionsList() {
    const [notifs, setNotifs] = useState<Notification[]>([]); 
    
    async function fetchNotifications() {
        try {
            const res = await fetch(`/api/users/notifications`, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            console.log(data.notif); 
            setNotifs(data.notif);
        }
        catch (error) {
            console.error();
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, [])

    return (
        <ul className="bg-neutral-950 rounded p-1">
            {
                notifs.map((notif) => (
                    <NotificationsItem notif={notif}/>
                ))
            }
        </ul>
    )
}

function NotificationsItem({notif} : {notif : Notification}) {
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