'use client'

import { useEffect, useState } from "react";
import Image from 'next/image' 
import { DateTime } from "next-auth/providers/kakao"
import { ButtonWithImg, SearchInput } from "../components/other";

type Notification = {
    id : string,
    projectId : string,
    name : string,
    icon : string | null,
    type : string,
    creatAt : Date,
    displayd : boolean
}

enum NotifictionsText {
    ProjectInvite = "You have been invited to project"
}

//TODO: fliters ...
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
        <>
            <section className="flex gap-4 mb-4 w-fit h-fit items-end">
                <SearchInput/>
                <ButtonWithImg/>
            </section>
            <ul className="rounded p-1 min-h-[40rem]">
                {
                    notifs.map((notif) => (
                        <NotificationsItem notif={notif}/>
                    ))
                }
            </ul>
        </>
    )
}

// TODO: accept/decline and design
function NotificationsItem({notif} : {notif : Notification}) {
    const currentDate: Date = new Date();
    /*var time : number = currentDate.getTime() - notif.creatAt.getTime() / (1000 * 60 * 60); // in Hours
    const day : number = 24
    if (time > day) { //If longer the one day then convert o days
        time = time / day;
    }*/

    var text : string;
    switch (notif.type) {
        case "ProjectInvite":
            text = NotifictionsText.ProjectInvite;
            break;
        default:
            text = NotifictionsText.ProjectInvite
    }

    return (
        <li className='bg-neutral-950 rounded p-2 w-full flex gap-4 relative'>
            <Image src={'/project.svg'} alt={''} width={30} height={30} className="bg-neutral-50 rounded w-16 h-fit block mt-auto mb-auto"></Image>
            <div className="flex flex-col gap-1 w-max">
                <h3>{notif.name}</h3>
                <p className="w-max">{text}</p>
                <time>{}</time>
            </div>
            <div className="gap-2 flex w-full flex-row justify-end items-end">
                <button className="btn-primary h-fit flex flex-col">Accept</button>
                <button className="btn-destructive h-fit flex flex-col">Decline</button>
            </div>
        </li>
    )
} 