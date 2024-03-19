"use client"

import { ButtonWithImg, SearchInput } from "@/app/components/other"
import { Head, TeamBadge } from "../components/other"
import { FilterButton } from "../components/filter-tables"
import { Team } from "@prisma/client"
import { FormEvent, useEffect, useReducer, useState } from "react"
import { Dialog, DialogClose } from "@/app/components/dialog"
import { FormItem } from "@/app/components/form"
import Image from "next/image"

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
    position: string | null,
    image: string | null,
}

export default function Teams({ projectId } : { projectId : string}) {
    const [teams, setTeams] = useState<TeamInfo[]>([]);
    const [isAdding, toggleAdding ] = useReducer(isAdding => !isAdding, false); 

    async function fetchTeams() {
        try {
            const res = await fetch(`/api/projects/${projectId}/team`, {
                method: "GET"
            });
            const data = await res.json();
            if (!res.ok) {
                console.error(data.error);
                return;
            }
            setTeams(data.teams);
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => { fetchTeams() }, []);

    return (
        <>
            { isAdding && <AddDialog projectId={projectId} handleCloseDialog={toggleAdding} /> }
            <Head text="Teams" />
            <section className='flex gap-4 mb-4 w-fit h-fit items-end'>
                <SearchInput/>
                <ButtonWithImg image="/person-add.svg" alt="team" title="Create Team" onClick={toggleAdding}/>
            </section>
            <section>
                <TeamsTable teams={teams}/>
            </section>
        </>
    )
}

function TeamsTable({ teams } : { teams : TeamInfo[] }) {
    return (
        <table className="bg-neutral-950 rounded flex flex-col">
            <thead className="">
                <tr className='py-2 px-3 grid grid-cols-4 justify-items-left items-center'>
                    <th className='w-fit'>Name</th>
                    <th className="w-fit">Members</th>
                    <th className='w-fit'>Num Of Members</th>
                    <th className='w-fit'>Tasks Load</th>
                </tr>
            </thead>
            <tbody className='flex flex-col gap-1 p-1'>
                {
                    teams.map((team) => (
                        <TeamRow teamInfo={team}/>
                    ))
                }
            </tbody>
        </table>
    )
}

function TeamRow({ teamInfo } : { teamInfo : TeamInfo }) {
    return (
        <tr key={teamInfo.id} className='bg-neutral-900 rounded grid grid-cols-5 p-2 justify-items-left items-center'>
            <td>{teamInfo.name}</td>
            <Members members={teamInfo.members}/>
        </tr>
    )
}

function Members({ members } : { members : TeamMemberInfo[] }) {
    return (
        <td className="flex">
            {
                members.map((member) => {
                    return (
                        <></>
                    )
                })
            }
        </td>
    )
}

function AddDialog({ projectId, handleCloseDialog } : { projectId : string,  handleCloseDialog : () => void}) {
    const [ correct, setCorrect ] = useState<boolean>(true);
    const [ members, setMembers ] = useState<MemberInfo[]>([]);
    const [ selected, setSelected ] = useState<MemberInfo[]>([]);
    const [ msg, setMsg ] = useState<string>("");

    function updateSelected(members : MemberInfo[]) {
        setSelected(members);
    }

    async function handleCreateTeam(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name");
        const color = formData.get("color");
        try {
            const res = await fetch(`/api/projects/${projectId}/team/create`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({
                    name: name,
                    color: color,
                    members: selected
                })
            })
            const data = await res.json(); 
            if (!res.ok) {
                setMsg(data.error);
                console.error(data.error);
                return
            }
            fetchMembers();
            setMsg(data.msg);
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => { fetchMembers() }, []);

    async function fetchMembers() {
        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                method: "GET"
            })
            const data = await res.json(); 
            if (!res.ok) {
                console.error(data.error);
                fetchMembers();
            }
            console.log(data);
            setMembers(data.data); 
        }
        catch (error) {
            console.error(error);
        }
    }
    return (
        <Dialog>
            <div className="bg-neutral-950 w-50 h-50 rounded p-8  relative">
                <DialogClose handleClose={handleCloseDialog}/>
                <div className="flex flex-row gap-8">
                    <div className="flex flex-col gap-4">
                        <h2 className="font-bold text-xl">Create Team</h2>
                        <form className="space-y-4" onSubmit={handleCreateTeam}>
                            <FormItem item="Name" type="text" name="name" correct={correct}/>
                            <div className="flex gap-2">
                                <label>Set Color</label>
                                <input type="color" name="color" className="bg-neutral-900 rounded p-1"></input>
                            </div>
                            <div className="w-full flex flex-row-reverse">
                                <button className="btn-primary">Create</button>
                            </div>
                            <p>{msg}</p>
                        </form>
                    </div>
                    <SelectMembers members={members} selected={selected} updateSelected={updateSelected}/>
                </div>
                
            </div>  
        </Dialog>
    )
}

function SelectMembers({ members, selected, updateSelected } : { members : MemberInfo[], selected : MemberInfo[], updateSelected : (membres : MemberInfo[]) => void}) {
    //console.log(members);
    function handleSelect(selectedMember : MemberInfo, active : boolean) {
        if (active) {
            const index = selected.findIndex(member => member.id === selectedMember.id);
            if (index != -1) {
                selected.splice(index, 1);
            }
        } else {
            selected.push(selectedMember);
        }
        updateSelected(selected);
    }   
    return (
        <section>
            <ul className="bg-neutral-900 rounded p-1 flex flex-col gap-1 w-72 h-96 overflow-y-auto">
                {
                    members && members.map((member) => {
                        let active = false;
                        for (const select of selected) {
                            if (select.id == member.id) {
                                active = true;
                                break;
                            }
                        }
                        return ( 
                            <ProjectMember member={member} active={active} onClick={() => handleSelect(member, active)} />
                        )
                    })
                }
            </ul>
        </section>
    )
}

function ProjectMember({ member, active, onClick } : { member : MemberInfo, active : boolean, onClick : () => void }) {
    const [ac, setAc] = useState<boolean>(active);
    let img = "/avatar.svg";
    if (member.image) {
        img = `/uploads/user/${member.image}`;
    }

    function handleClick() {
        setAc(!ac);
        onClick();
    }
    console.log(member);
    return (
        <li key={member.memberId} onClick={handleClick} className={`box-content flex gap-4 bg-neutral-950 rounded items-center p-1 ${ac && " outline outline-1 outline-green-500"} cursor-pointer`}>
            <Image src={img} alt="" height={15} width={15} className="rounded-full w-5 h-5"></Image>
            <p>{member.name} {member.surname}</p>
            { member.teamName && <TeamBadge name={member.teamName} color={""}/>}
        </li>
    )
}
