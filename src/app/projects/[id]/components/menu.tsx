import { Project } from "@prisma/client";
import Image from 'next/image'
import Link from "next/link";
import { ProjectInfo } from "./menu-info";

export default function ProjectMenu({ id } : { id : string }) {

    return (
        <div className="flex flex-col bg-neutral-950 min-h-screen w-48 p-4 gap-8 border-r border-neutral-600 overflow-hidden align-middle">
            <ProjectInfo id={id}/>
            <section>
                <h3 className="text-sm text-neutral-400 mb-2">Planning</h3>
                <ul className="flex flex-col gap-2">
                    <BoardLink name="dashboard" id={id} text="Dashboard" />
                    <BoardLink name="board" id={id} text="Board"/>
                    <BoardLink name="timetable" id={id} text="Time Table"/>
                    <BoardLink name="backlog" id={id} text="Backlog"/>
                </ul>
            </section>
            <section>
                <h3 className="text-sm text-neutral-400 mb-2">More</h3>
                <ul>
                    <SideMenuLink id={id} name="Members" to="members" img="/members.svg"/>
                    <SideMenuLink id={id} name="Code" to="code" img="/code.svg"/>
                    <SideMenuLink id={id} name="Settings" to="setting" img="/settings.svg"/>
                </ul>
            </section>  
        </div>
    )
}


function BoardLink( { name, id, text } : { name : string, id : string, text : string } ) {
    const src : string = "/" + name.toLocaleLowerCase()  + ".svg"
    return (
        <li className="flex gap-2 items-center h-7">
            <Image src={src} alt="" height={5} width={5} className="h-5 w-5"/>
            <Link href={`/projects/${id}/boards/${name}`} className='link-secundary'>{text}</Link>
        </li>
    )
}

function SideMenuLink( { id, name, to, img } : { id : string, name: string, to : string, img : string } ) {
    return (
        <li className="flex gap-2 items-center h-7">
            <Image src={img} alt="" height={5} width={5} className="h-5 w-5"/>
            <Link href={`/projects/${id}/${to}`} className='link-secundary'>{name}</Link>
        </li>
    )
}

