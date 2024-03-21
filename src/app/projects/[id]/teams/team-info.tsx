"use client"

import { Task, Team } from "@prisma/client"
import { Component, useEffect, useState } from "react"
import { Dialog, DialogClose } from "@/app/components/dialog"
import { FormItem } from "@/app/components/form"
import Image from "next/image"

import { TeamBadge } from "../components/other"

type TeamInfo = {
    id : string,
    name: string,
    members: TeamMemberInfo[]
}

type TeamMemberInfo = {
    id : string,
    memberId: string,
    name : string,
    surname : string,
    image : string | null
}

type MemberInfo = {
    id : string,
    memberId: string,
    name: string,
    surname: string,
    teamId: string | null,
    teamName: string | null,
    image: string | null,
}

type TaskInfo = {

}

export function TeamDialog({ team, projectId, closeSettings } : { team : TeamInfo, projectId : string, closeSettings : () => void}) {
    const [infteam, setInfTeam] = useState<TeamInfo | null>(team);

    
    function updateTeam() {

    }
    return (
        <Dialog>
            <div className="bg-neutral-950 w-fit rounded relative">
                <TeamHead team={team} closeSettings={closeSettings} />
                <Container team={team} updateTeam={updateTeam} projectId={projectId}/>
            </div>
        </Dialog>
    )
}

function TeamHead({ team, closeSettings } : { team : TeamInfo, closeSettings : () => void}) {
    return (
        <div className="p-4 relative w-full border-b">
            <DialogClose handleClose={closeSettings}/>
            <h2 className="text-xl font-bold">{team.name}</h2>
        </div>
    )
}

enum TypeOfInfo {
    members = "Members",
    tasks = "Tasks",
}

function Container({ team, projectId, updateTeam } : { team : TeamInfo, projectId : string, updateTeam : (team : TeamInfo) => void }) {
    const menuItems : TypeOfInfo[] = [TypeOfInfo.members, TypeOfInfo.tasks];
    const [actualTypeInfo, setActualInfoType] = useState<TypeOfInfo>(TypeOfInfo.members);
    const [actualInfo, setActualInfo] = useState<JSX.Element>(<Members team={team} projectId={projectId}/>);

    function handleChangeType(type : TypeOfInfo) {
        switch (type) {
            case TypeOfInfo.tasks:
                setActualInfo(<Tasks/>);
                setActualInfoType(TypeOfInfo.tasks);
                break;
            default:
                setActualInfo(<Members team={team} projectId={projectId}/>);
                setActualInfoType(TypeOfInfo.members);
        }
    }


    return (
        <section className='col-span-2 h-fit w-[46rem] ralative'>
            <menu className='flex w-full border-b'>
                {
                    menuItems.map((type) => (
                        <MenuItem name={type} actualType={actualTypeInfo} onClick={() => handleChangeType(type)}></MenuItem>
                    ))
                }
            </menu>
            {actualInfo}
        </section>
    )
}

function MenuItem({ name, actualType, onClick } : { name : string, actualType : TypeOfInfo, onClick : () => void}) {
    var bg : string = "bg-neutral-950";
    if (actualType == name) {
        bg = "bg-neutral-900";
    }
    return (
        <li className={`relative  ${bg}`}>
            <button onClick={onClick} className="hover:text-purple-600 px-4 py-2" >{name}</button>
        </li>
    )
}

function Members({ team, projectId } : { team : TeamInfo, projectId : string}) {
    const [ teamMembers, setTeamMembers ] = useState<MemberInfo[]>([]);
    const [ members, setMembers ] = useState<MemberInfo[]>([]);

    function handleSelect(member : MemberInfo, active : boolean) {

    }

    async function fetchMembers() {
        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                method: "GET"
            })
            const data = await res.json(); 
            if (!res.ok) {
                console.error(data.error);
            }
            const projectMembers : MemberInfo[] = data.data;
            const sorted : MemberInfo[] = [];
            for (const member of projectMembers) {
                if (member.teamId != team.id) {
                    sorted.push(member);
                }
            }
            setMembers(sorted); 
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => { 
        fetchMembers(); 
        setTeamMembers(convertTeamToMembers(team));
    }, []);

    
    return (
        <section className="p-4  h-fit relative flex gap-4 w-full justify-around">
            <MembersColumn type={MemberType.team} members={teamMembers}/>
            <MembersColumn type={MemberType.other} members={members}/>
        </section>
        
    )
}

function Tasks() {
    return (
        <></>
    )
}

enum MemberType {
    team = "Team",
    other = "Other"
}

function MembersColumn({ type, members } : { type : MemberType, members : MemberInfo[] }) {
    return (
        <section className="h-full">
            <h3>{type} Members</h3>
            <ul className="bg-neutral-900 rounded p-1 flex flex-col gap-1 flex-1 h-[28rem] w-[16rem] overflow-y-auto">
                {
                    members.map((member) => {
                        return ( 
                            <ProjectMember member={member}/>
                        )
                    })
                }
            </ul>
        </section>
    )
}   

function ProjectMember({ member } : { member : MemberInfo}) {
    let img = "/avatar.svg";
    if (member.image) {
        img = `/uploads/user/${member.image}`;
    }
    return (
        <li key={member.memberId} draggable className={`box-content flex gap-4 bg-neutral-950 rounded items-center p-1 cursor-pointer`}>
            <Image src={img} alt="" height={15} width={15} className="rounded-full w-5 h-5"></Image>
            <p>{member.name} {member.surname}</p>
            { member.teamName && <TeamBadge name={member.teamName} color={""}/>}
        </li>
    )
}

function convertTeamToMembers(team : TeamInfo ) {
    const conv : MemberInfo[] = team.members.map((member) => (
        {
            id: member.id, 
            memberId: member.memberId, 
            name: member.name, 
            surname: member.surname, 
            image: member.image,
            teamId: team.id,
            teamName: team.name
        }
    ))
    return conv
}