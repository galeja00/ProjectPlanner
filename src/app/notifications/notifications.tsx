'use client'

import { useEffect, useReducer, useState } from "react";
import Image from 'next/image' 
import { formatAgo } from "@/date";
import { ButtonWithText } from "../components/buttons";
import { ErrorBoundary, useError } from "../components/error-handler";
import { InitialLoader } from "../components/other-client";
import { getImage, ImageTypes } from "@/images";
import { DeleteDialog } from "../components/other";


// type for notification to display it to user
type Notification = {
    id : string,
    projectId : string,
    name : string,
    icon : string | null,
    type : string,
    agoInSeconds : number,
    displayd : boolean
}

// enum for different notiffications right now only about invite
enum NotifictionsText {
    ProjectInvite = "You have been invited to project"
}

export default function Notifications() {
    return ( 
        <ErrorBoundary>
            <NotifiactionsList/>
        </ErrorBoundary>
    )
}

// component for diplaying user notification and accepting or removing
function NotifiactionsList() {
    const [notifs, setNotifs] = useState<Notification[]>([]); 
    const [initialLoading, setInitialLoading] = useState<boolean>(false);
    const { submitError } = useError(); 
    
    // get all user notifications from endpoint
    async function fetchNotifications(isInitialLoading : boolean) {
        if (isInitialLoading) {
            setInitialLoading(true);
        }
        try {
            const res = await fetch(`/api/users/notifications`, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message);
            }
            setNotifs(data.notif);
        }
        catch (error) {
            console.error();
            submitError(error, () => fetchNotifications(true));
        }
        finally {
            setInitialLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications(true);
    }, [])

    if (initialLoading) {
        return (
            <InitialLoader/>
        )
    }

    return (
        <>
            <ul className="rounded p-1 min-h-[40rem] space-y-2">
                {
                    notifs.map((notif) => (
                        <NotificationsItem key={notif.id} notif={notif} updateNotif={() => fetchNotifications(false)}/>
                    ))
                }
                { notifs.length == 0 && <div>Currently, you have zero projects.</div>}
            </ul>
        </>
    )
}

// display notifications informations and handle functions with them
function NotificationsItem({notif, updateNotif} : {notif : Notification, updateNotif : () => void}) {
    const [ isDecline, toggleIsDecline ] = useReducer(isDecline => !isDecline, false);
    const { submitError } = useError(); 

    // handle click on buttons by submiting it to endpoint
    async function handleSubmitRes(type : string) {
        try {
            const res = await fetch(`/api/users/projectInvites/${type}`, {
                method: "POST",
                body: JSON.stringify({
                    id: notif.id
                })
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message);
            }
            updateNotif();
        }
        catch (error) {
            console.error(error);
            submitError(error, () =>  handleSubmitRes(type));
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
    let ago : number = notif.agoInSeconds;
    console.log(ago);
    let agoText : string = formatAgo(ago);
    console.log(agoText);
    let image : string = getImage(notif.icon, ImageTypes.Project);

    return (
        <>
            { isDecline && <DeleteDialog message="Do you really want to decline this invitation?" onClose={toggleIsDecline} onConfirm={() => handleSubmitRes("decline")}/>}
            <li className='bg-neutral-200 rounded p-2 w-full flex gap-4 relative'>
                <Image src={image} alt={''} width={80} height={80} className="bg-neutral-100 rounded w-20 h-fit block mt-auto mb-auto"></Image>
                <div className="flex flex-col gap-1 w-max h-fit justify-between">
                    <h3 className="w-max">{text}</h3>
                    <p className="w-max">{notif.name}</p>
                    <time className="text-sm text-neutral-400">{agoText}</time>
                </div>
                <div className="gap-2 flex w-full flex-row justify-end items-end">
                    <ButtonWithText text={"Accept"} type={"primary"} handle={() =>  handleSubmitRes("accept")}/>
                    <ButtonWithText text={"Decline"} type={"destructive"} handle={toggleIsDecline}/>
                </div>
            </li>
        </>
    )
} 