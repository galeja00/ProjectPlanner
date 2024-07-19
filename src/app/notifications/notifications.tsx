'use client'

import { useEffect, useState } from "react";
import Image from 'next/image' 
import { formatAgo } from "@/date";
import { ButtonWithText } from "../components/buttons";


// type for notification to display it to user
type Notification = {
    id : string,
    projectId : string,
    name : string,
    icon : string | null,
    type : string,
    agoInHours : number,
    displayd : boolean
}

// enum for different notiffications right now only about invite
enum NotifictionsText {
    ProjectInvite = "You have been invited to project"
}

// component for diplaying user notification and accepting or removing
export default function NotifiactionsList() {
    const [notifs, setNotifs] = useState<Notification[]>([]); 
    //const { submitError } = useError(); 
    
    // get all user notifications from endpoint
    async function fetchNotifications() {
        try {
            const res = await fetch(`/api/users/notifications`, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            setNotifs(data.notif);
        }
        catch (error) {
            console.error();
            //submitError(error, fetchNotifications);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, [])

    return (
        <>
            <ul className="rounded p-1 min-h-[40rem]">
                {
                    notifs.map((notif) => (
                        <NotificationsItem key={notif.id} notif={notif} updateNotif={fetchNotifications}/>
                    ))
                }
                { notifs.length == 0 && <li>Right now you have zero notifications</li>}
            </ul>
        </>
    )
}

// display notifications informations and handle functions with them
function NotificationsItem({notif, updateNotif} : {notif : Notification, updateNotif : () => void}) {
    //const { submitError } = useError(); 

    // handle click on buttons by submiting it to endpoint
    async function handleButtonClick(type : string) {
        try {
            const res = await fetch(`/api/users/projectInvites/${type}`, {
                method: "POST",
                body: JSON.stringify({
                    id: notif.id
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
            //submitError(error, () => handleButtonClick(type));
        }
    }
    
    // chack with type of notification it is
    var text : string;
    switch (notif.type) {
        case "ProjectInvite":
            text = NotifictionsText.ProjectInvite;
            break;
        default:
            text = NotifictionsText.ProjectInvite
    }

    // formats ago to readeble data for user
    var ago : number = notif.agoInHours;
    var agoText : string = formatAgo(ago);

    return (
        <li className='bg-neutral-200 rounded p-2 w-full flex gap-4 relative'>
            <Image src={'/project.svg'} alt={''} width={30} height={30} className="bg-neutral-950 rounded w-20 h-fit block mt-auto mb-auto"></Image>
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