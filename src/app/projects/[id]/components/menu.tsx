import { Project } from "@prisma/client";
import Image from 'next/image'
import Link from "next/link";

export default function ProjectMenu({ id } : { id : string }) {

    return (
        <div className="flex flex-col bg-neutral-950 min-h-screen w-60 p-4 gap-8 border-r border-neutral-600 overflow-hidden align-middle">
            <ProjectInfo id="id"/>
            <ul className="flex flex-col gap-2">
                <BoardLink name="dashboard" id={id} text="Dashboard" />
                <BoardLink name="board" id={id} text="Board"/>
                <BoardLink name="timetable" id={id} text="Time Table"/>
                <BoardLink name="backlog" id={id} text="Backlog"/>
            </ul>
            <ul>
                <li><Link href={`/projects/${id}/settings`} className='hover:text-violet-500 hover:border-b hover:border-violet-500 ease-in-out'>Settings</Link></li>
            </ul>
            
        </div>
        
    )
}


function BoardLink( { name, id, text} : { name : string, id : string, text : string} ) {
    return (
        <li><Link href={`/projects/${id}/boards/${name}`} className='link-secundary'>{text}</Link></li>
    )
}

function ProjectInfo( { id } : { id : string }) {
    return (
        <div className="flex gap-2">
            <Image src="/project.svg" alt="Project Icon" width={40} height={40} className="bg-neutral-50 rounded"></Image>
            <div>
                <h2>{id}</h2>
                <p></p>
            </div>
        </div>
    )
}

