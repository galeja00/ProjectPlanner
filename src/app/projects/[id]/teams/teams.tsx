"use client"

import { ButtonWithImg, SearchInput } from "@/app/components/other"
import { Head, TeamBadge } from "../components/other"
import { FilterButton } from "../components/filter-tables"
import { Task, Team } from "@prisma/client"
import { FormEvent, useEffect, useReducer, useState } from "react"
import { Dialog, DialogClose } from "@/app/components/dialog"
import { FormItem } from "@/app/components/form"
import Image from "next/image"
import { TeamDialog } from "./team-info"
import { InitialLoader } from "@/app/components/other-client"

// TODO: better work with types for little error
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

export default function Teams({ projectId } : { projectId : string}) {
    const [teams, setTeams] = useState<TeamInfo[]>([]);
    const [isAdding, toggleAdding ] = useReducer(isAdding => !isAdding, false); 
    const [isSettings, toggleSettings] = useReducer(isSettings => !isSettings, false); 
    const [team, setTeam] = useState<TeamInfo  | null>(null);
    const [initialLoading, setInitialLoading] = useState<boolean>(false); 


    async function fetchTeams() {
        setInitialLoading(true);
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
        finally {
            setInitialLoading(false)
        }
    }

    async function deleteTeam(teamId : string) {
        try {
            const res = await fetch(`/api/projects/${projectId}/team/delete`, {
                method: "POST", 
                body: JSON.stringify({
                    teamId: teamId
                })
            })
            if (res.ok) {
                const newTeams : TeamInfo[] = [];
                for(const team of teams) {
                    if (team.id != teamId) {
                        newTeams.push(team);
                    }
                }
                setTeams(newTeams);
                return;
            }
            const data = await res.json(); 
            console.error(data.error);
        }
        catch (error) {
            console.error(error);
        }
    }

    function openSettings(teamId : string) {
        for (const team of teams) {
            if (team.id == teamId) {
                setTeam(team);
                break;
            }
        }
        toggleSettings();
    }

    function closeSettings() {
        setTeam(null);
        toggleSettings();
    }

    useEffect(() => { fetchTeams() }, []);

    return (
        <>
            { isSettings && team && <TeamDialog team={team} projectId={projectId} updateTeams={fetchTeams} closeSettings={closeSettings}/>}
            { isAdding && <AddDialog projectId={projectId} handleCloseDialog={toggleAdding} updateTeams={fetchTeams} /> }
            <Head text="Teams" />
            <section className='flex gap-4 mb-4 w-fit h-fit items-end'>
                {/*<SearchInput/>*/}
                <ButtonWithImg image="/person-add.svg" alt="team" title="Create Team" onClick={toggleAdding}/>
            </section>
            <section>
                {
                    initialLoading ? 
                        <InitialLoader/>
                        :
                        <TeamsTable teams={teams} handleDelete={deleteTeam} openSettings={openSettings}/>
                }
            </section>
        </>
    )
}

function TeamsTable({ teams, handleDelete, openSettings  } : { teams : TeamInfo[], handleDelete : (id : string) => void, openSettings : (id : string) => void }) {
    return (
        <table className="bg-neutral-200 rounded flex flex-col">
            <thead className="">
                <tr className='py-2 px-3 grid grid-cols-9 gap-2 justify-items-left items-center'>
                    <th className='w-fit col-span-2'>Name</th>
                    <th className="w-fit col-span-2">Members</th>
                    <th className='w-fit col-span-2'>Count Of Members</th>
                    <th className='w-fit col-sapn-2'>Tasks Load</th>
                    <th></th>
                </tr>
            </thead>
            <tbody className='flex flex-col gap-1 p-1'>
                {
                    teams.map((team) => (
                        <TeamRow key={team.id} teamInfo={team} handleDelete={() => handleDelete(team.id)} openSettings={() => openSettings(team.id)}/>
                    ))
                }
            </tbody>
        </table>
    )
}

function TeamRow({ teamInfo, handleDelete, openSettings } : { teamInfo : TeamInfo, handleDelete : () => void, openSettings : () => void}) {
    const count = teamInfo.members.length;
    return (
        <tr key={teamInfo.id} className='bg-neutral-100 rounded py-2 px-3 grid grid-cols-9 gap-2 justify-items-left items-center'>
            <td className="col-span-2">{teamInfo.name}</td>
            <Members members={teamInfo.members}/>
            <td className="col-span-2">{count}</td>
            <td className="col-span-2">{teamInfo.taskLoad}</td> {/*TODO: fetch info about number of tasks*/} 
            <td className="h-fit flex gap-2 items-center justify-end">
                <button onClick={handleDelete} className="w-fit h-fit bg-neutral-200 rounded hover:outline hover:outline-1 hover:outline-red-600">
                    <img src="/x.svg" title="Delete Group" className="w-8 h-8 hover:bg-red-600 rounded hover:bg-opacity-40"></img>
                </button>
                <button onClick={openSettings} className="w-fit h-fit bg-neutral-200 rounded hover:outline hover:outline-1 hover:outline-violet-600">
                    <img src="/settings.svg" title="Edit Team" className="w-8 h-8 p-2 rounde hover:bg-violet-600 hover:bg-opacity-40"></img>
                </button>
            </td>
            
        </tr>
    )
}

function Members({ members } : { members : TeamMemberInfo[] }) {
    const displayNum = 10;
    return (
        <td className="flex col-span-2">
            <ul className="flex gap-1">
            {
                members.slice(0, displayNum).map((member, index) => {
                    let img = "/avatar.svg"
                    if (member.image) {
                        img = `/uploads/user/${member.image}`
                    }
                    return (
                        <li key={member.id}><Image title={`${member.name} ${member.surname}`} src={img} height={30} width={30} alt="member" className="rounded-full w-6 h-6"/></li>
                    )
                })
            }
            </ul>
        </td>
    )
}


function AddDialog({ projectId, handleCloseDialog, updateTeams } : { projectId : string,  handleCloseDialog : () => void, updateTeams : () => void}) {
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
            updateTeams();
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
            <div className="bg-neutral-200 w-50 h-fit rounded p-8 relative">
                <DialogClose handleClose={handleCloseDialog}/>
                <div className="flex flex-row gap-8">
                    <div className="flex flex-col gap-4">
                        <h2 className="font-bold text-xl">Create Team</h2>
                        <form className="space-y-4" onSubmit={handleCreateTeam}>
                            <FormItem item="Name" type="text" name="name" correct={correct}/>
                            <div className="flex gap-2">
                                <label>Set Color</label>
                                <input type="color" name="color" className="bg-neutral-100 rounded p-1"></input>
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
            <ul className="bg-neutral-100 rounded p-1 flex flex-col gap-1 w-72 h-96 overflow-y-auto">
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
                            <ProjectMember key={member.id} member={member} active={active} onClick={() => handleSelect(member, active)} />
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
        <li key={member.memberId} onClick={handleClick} className={`box-content flex gap-4 bg-neutral-200 rounded items-center p-1 ${ac && "outline outline-1 outline-green-500"} cursor-pointer`}>
            <Image src={img} alt="" height={15} width={15} className="rounded-full w-5 h-5"></Image>
            <p>{member.name} {member.surname}</p>
            { member.teamName && <TeamBadge name={member.teamName} color={""}/>}
        </li>
    )
}


