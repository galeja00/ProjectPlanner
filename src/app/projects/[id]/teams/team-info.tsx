"use client"

import { Tag, Task, Team } from "@prisma/client"
import { Component, useEffect, useReducer, useState } from "react"
import { Dialog, DialogClose } from "@/app/components/dialog"
import { FormItem } from "@/app/components/form"
import Image from "next/image"

import { TeamBadge } from "../components/other"
import { Name } from "../components/other-client"
import { TagList } from "../components/tags"

type TeamInfo = {
    id : string,
    name: string,
    taskLoad: number,
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


export function TeamDialog({ team, projectId, closeSettings, updateTeams } : { team : TeamInfo, projectId : string, closeSettings : () => void, updateTeams : () => void}) {
    const [infteam, setInfTeam] = useState<TeamInfo>(team);

    function close() {
        updateTeams();
        closeSettings();
    }
    
    async function updateTeam(team : TeamInfo) {
        try {
            const res = await fetch(`/api/projects/${projectId}/team/${team.id}/update`, {
                method: "POST",
                body: JSON.stringify({
                    name: team.name,
                })
            })

            if (res.ok) {
                setInfTeam(team);  
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <Dialog>
            <div className="bg-neutral-950 w-fit rounded relative">
                <TeamHead team={infteam} closeSettings={close} updateTeam={updateTeam}/>
                <Container team={infteam} projectId={projectId}/>
            </div>
        </Dialog>
    )
}

function TeamHead({ team, closeSettings, updateTeam } : { team : TeamInfo, closeSettings : () => void, updateTeam : (team : TeamInfo) => void}) {
    const tags : Tag[] = [];
    function updateName(name : string) {
        team.name = name;
        updateTeam(team); 
    }
    return (
        <div className="p-4 relative w-full border-b">
            <DialogClose handleClose={closeSettings}/>
            <Name name={team.name} updateName={updateName}/>
            <TagList tags={tags}/>
        </div>
    )
}

enum TypeOfInfo {
    members = "Members",
    tasks = "Tasks",
}

function Container({ team, projectId} : { team : TeamInfo, projectId : string}) {
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
                        <MenuItem key={type} name={type} actualType={actualTypeInfo} onClick={() => handleChangeType(type)}></MenuItem>
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

function Members({ team, projectId} : { team : TeamInfo, projectId : string}) {
    const [ teamMembers, setTeamMembers ] = useState<MemberInfo[]>([]);
    const [ members, setMembers ] = useState<MemberInfo[]>([]);

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

    async function addMember(member : MemberInfo) {
        try {
            const res = await fetch(`/api/projects/${projectId}/team/${team.id}/addMember`, {
                method: "POST",
                body: JSON.stringify({
                    memberId: member.memberId,
                    teamId: team.id
                })
            })

            if (res.ok) {
                fetchMembers(); 
                let newTeamMembers : MemberInfo[] = teamMembers;
                member.teamId = team.id;
                member.teamName = team.name;
                newTeamMembers.push(member);
                setTeamMembers(newTeamMembers);
                //team.members = newTeamMembers;
                //updateTeam(team);
                return;
            }

            const data = await res.json();
            console.error(data.error);  
        }
        catch (error) {
            console.error(error);
        }
    }

    async function removeMember(member : MemberInfo) {
        try {
            const res = await fetch(`/api/projects/${projectId}/team/${team.id}/removeMember`, {
                method: "POST",
                body: JSON.stringify({
                    memberId: member.memberId
                })
            })
            console.log(member);
            console.log(teamMembers);
            if (res.ok) {
                fetchMembers();
                let newTeamMembers : MemberInfo[] = [];
                for (const mem of teamMembers) {
                    if (mem.memberId != member.memberId) {
                        newTeamMembers.push(mem);
                    }
                }
                setTeamMembers(newTeamMembers); 
                //team.members = newTeamMembers;
                //updateTeam(team);
                return;
            }

            const data = await res.json();
            console.error(data.error);  
        }
        catch (error) {
            console.error(error);
        }
    }

    function handleMove(member : MemberInfo, type : ColumnType) {
        if (member.teamId == null || member.teamId != team.id) {
            if (type != ColumnType.team) {
                return;
            }
            addMember(member);
        } else {
            if (type != ColumnType.other) {
                return;
            }
            removeMember(member);
        }
    }

    useEffect(() => { 
        fetchMembers(); 
        setTeamMembers(convertTeamToMembers(team));
    }, []);

    
    return (
        <section className="p-4 h-fit relative flex gap-4 w-full justify-around">
            <MembersColumn type={ColumnType.team} members={teamMembers} handleMove={handleMove}/>
            <MembersColumn type={ColumnType.other} members={members} handleMove={handleMove}/>
        </section>
        
    )
}



enum ColumnType {
    team = "Team",
    other = "Other"
}

function MembersColumn({ type, members, handleMove } : { type : ColumnType, members : MemberInfo[], handleMove : (member : MemberInfo, type : ColumnType) => void }) {
    const [isDraged, toggleDraged] = useReducer(isDraged => !isDraged, false);
    function handleOnDrop(e : React.DragEvent) {
        e.preventDefault();
        const jsonString = e.dataTransfer.getData("json/member");
        const member = JSON.parse(jsonString);
        handleMove(member ,type); 
        if(isDraged) {
            toggleDraged();
        }
    }

    function handleOnDragOver(e : React.DragEvent) {
        e.preventDefault();
        if (!isDraged) {
            toggleDraged();   
        }
    }

    function handleOnLeave(e : React.DragEvent) {
        e.preventDefault();
        if (isDraged) {
            toggleDraged();
        }
    }
    // TODO: dataTranfer to on drop
    function handleDrag(e : React.DragEvent, member : MemberInfo) {
        e.dataTransfer.setData("json/member", JSON.stringify(member));
    }

    return (
        <section 
            className="h-full"
            onDrop={handleOnDrop}
            onDragOver={handleOnDragOver}
            onDragLeave={handleOnLeave}
            onDragExit={handleOnLeave}
            >
            <h3>{type} Members</h3>
            <ul className={` rounded p-1 flex flex-col gap-1 flex-1 h-[30rem] w-[20rem] overflow-y-auto ${isDraged ? "bg-violet-600" : "bg-neutral-900"}`}>
                {
                    members.map((member) => {
                        return ( 
                            <ProjectMember key={member.memberId} member={member} handleOnDrag={(e) => handleDrag(e, member)} />
                        )
                    })
                }
            </ul>
        </section>
    )
}   

function ProjectMember({ member, handleOnDrag } : { member : MemberInfo, handleOnDrag : (e : React.DragEvent) => void }) {
    let img = "/avatar.svg";
    if (member.image) {
        img = `/uploads/user/${member.image}`;
    }
    return (
        <li key={member.memberId} draggable onDragStart={handleOnDrag} className={`box-content flex gap-4 bg-neutral-950 rounded items-center p-1 cursor-pointer`}>
            <Image src={img} alt="Picture" height={15} width={15} className="rounded-full w-5 h-5"></Image>
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

function Tasks() {
    const [ tasks, setTasks ] = useState<Task[]>([]);
    return (
        <section>
            <ul>
                {
                    tasks.map((task) => (
                        <TaskComp task={task}/>
                    ))
                }
            </ul>
        </section>
    )
}

function TaskComp({ task } : { task : Task }) {
    return (
        <li key={task.id}>

        </li>
    )
}