import { Project } from "@prisma/client";
import Image from 'next/image'
import Link from "next/link";

export default function ProjectMenu({ id , type } : { id : string , type : string}) {
    return (
        <div className="flex flex-col bg-neutral-950 min-h-screen w-60 p-4 gap-8 border-r border-neutral-600 overflow-hidden align-middle">
            <div className="flex gap-2">
                <Image src="/project.svg" alt="Project Icon" width={30} height={30} className="bg-neutral-50 rounded"></Image>
                <h2>{id}</h2>
            </div>
            
            <ul className="flex flex-col gap-2">
                <BoardLink name="dashboard" id={id} type={type} text="Dashboard" />
                <BoardLink name="board" id={id} type={type} text="Board"/>
                <BoardLink name="timetable" id={id} type={type} text="Time Table"/>
                <BoardLink name="backlog" id={id} type={type} text="Backlog"/>
            </ul>
            <ul>
                <li><Link href={`/projects/${type}/${id}/settings`} className='hover:text-violet-500 hover:border-b hover:border-violet-500 ease-in-out'>Settings</Link></li>
            </ul>
            
        </div>
        
    )
}


function BoardLink( { name, id, type, text} : { name : string, id : string, type : string, text : string} ) {
    return (
        <li><Link href={`/projects/${type}/${id}/boards/${name}`} className='hover:text-violet-500 hover:border-b hover:border-violet-500 ease-in-out'>{text}</Link></li>
    )
}

