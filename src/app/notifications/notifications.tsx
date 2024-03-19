'use client'

import { useEffect, useState } from "react";
import Image from 'next/image' 
import { ButtonWithImg, ButtonWithText, SearchInput } from "../components/other";

type Notification = {
    id : string,
    projectId : string,
    name : string,
    icon : string | null,
    type : string,
    agoInHours : number,
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
                <ButtonWithImg image="filter.svg" alt="filter" title="Filter Members" onClick={()=>new Error("Not implemented")}/>
            </section>
            <ul className="rounded p-1 min-h-[40rem]">
                {
                    notifs.map((notif) => (
                        <NotificationsItem notif={notif} updateNotif={fetchNotifications}/>
                    ))
                }
            </ul>
        </>
    )
}


function NotificationsItem({notif, updateNotif} : {notif : Notification, updateNotif : () => void}) {
    async function handleButtonClick(type : string) {
        try {
            const res = await fetch(`/api/users/projectInvites/${type}`, {
                method: "POST",
                body: JSON.stringify({
                    userId: notif.id
                })
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            updateNotif();
        }
        catch (error) {
            console.error(error);
        }
    }
    
    var text : string;
    switch (notif.type) {
        case "ProjectInvite":
            text = NotifictionsText.ProjectInvite;
            break;
        default:
            text = NotifictionsText.ProjectInvite
    }

    var ago : number = notif.agoInHours;
    var agoText : string = "h";
    if (ago > 24) {
        ago = ago / 24;
        agoText = "d";
    }

    return (
        <li className='bg-neutral-950 rounded p-2 w-full flex gap-4 relative'>
            <Image src={'/project.svg'} alt={''} width={30} height={30} className="bg-neutral-50 rounded w-20 h-fit block mt-auto mb-auto"></Image>
            <div className="flex flex-col gap-1 w-max h-fit justify-between">
                <h3 className="w-max">{text}</h3>
                <p className="w-max">{notif.name}</p>
                <time className="text-sm text-neutral-400">{notif.agoInHours} {agoText}</time>
            </div>
            <div className="gap-2 flex w-full flex-row justify-end items-end">
                <ButtonWithText text={"Accept"} type={"primary"} handle={() => handleButtonClick("accept")}/>
                <ButtonWithText text={"Decline"} type={"destructive"} handle={() => handleButtonClick("decline")}/>
            </div>
        </li>
    )
} 