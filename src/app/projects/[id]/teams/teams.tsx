"use client"

import {} from "@/app/components/other"
import { Head, TeamBadge } from "../components/other"
import { FilterButton } from "../components/filter-tables"
import { Task, Team } from "@prisma/client"
import { FormEvent, useEffect, useReducer, useState } from "react"
import { Dialog, DialogClose } from "@/app/components/dialog"
import { FormItem } from "@/app/components/form"
import Image from "next/image"
import { TeamDialog } from "./team-info"
import { InitialLoader } from "@/app/components/other-client"
import { ErrorBoundary, ErrorState, useError } from "@/app/components/error-handler"
import { ButtonWithImg } from "@/app/components/buttons"
import { getImage, ImageTypes } from "@/images"

// type for teams and with mebers are in teams
type TeamInfo = {
    id : string,
    name: string,
    color: string | null,
    taskLoad: number,
    members: TeamMemberInfo[]
}

// type for members with are in team
type TeamMemberInfo = {
    id : string,
    memberId: string,
    name : string,
    surname : string,
    image : string | null
}

// information about members with arent in team
type MemberInfo = {
    id : string,
    memberId: string,
    name: string,
    surname: string,
    teamId: string | null,
    teamName: string | null,
    image: string | null,
}

// deafult componenet inhouse other smaller parts of teams information and states for moving parts
export default function Teams({ projectId } : { projectId : string}) {
    const [teams, setTeams] = useState<TeamInfo[]>([]);// data about all teams
    const [isAdding, toggleAdding ] = useReducer(isAdding => !isAdding, false); // indicate if is user creating/adding a team to project
    const [isSettings, toggleSettings] = useReducer(isSettings => !isSettings, false); // indicate if is setting of some team open
    const [team, setTeam] = useState<TeamInfo  | null>(null); // info about team when user is adding memebrs or remuving same with task
    const [initialLoading, setInitialLoading] = useState<boolean>(false); 
    const { submitError } = useError();// for errro handeling

    // get data about teams in project from REST-APi
    async function fetchTeams() {
        setInitialLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/team`, {
                method: "GET"
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
                return;
            }
            setTeams(data.teams);
        }
        catch (error) {
            console.error(error);
            submitError(error, fetchTeams);
        }
        finally {
            setInitialLoading(false)
        }
    }

    // delete team from project 
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
            throw new Error(data.error);
        }
        catch (error) {
            console.error(error);
            submitError(error, fetchTeams);
        }
    }

    // handle if user want to open dialog where he can edit team
    function openSettings(teamId : string) {
        for (const team of teams) {
            if (team.id == teamId) {
                setTeam(team);
                break;
            }
        }
        toggleSettings();
    }

    // handle close of dialog for editing team
    function closeSettings() {
        setTeam(null);
        toggleSettings();
    }

    // initial fetch of data
    useEffect(() => { fetchTeams() }, []);

    return (
        <main className="max-w-screen-lg w-full mx-auto">
            { isSettings && team && <TeamDialog team={team} projectId={projectId} updateTeams={fetchTeams} closeSettings={closeSettings}/>}
            { isAdding && <AddDialog projectId={projectId} handleCloseDialog={toggleAdding} updateTeams={fetchTeams} /> }
            <Head text="Teams" />
            <section className='flex gap-4 mb-4 w-fit h-fit items-end'>
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
        </main>
    )
}

// create table where are display team row
function TeamsTable({ teams, handleDelete, openSettings  } : { teams : TeamInfo[], handleDelete : (id : string) => void, openSettings : (id : string) => void }) {
    return (
        <table className="bg-neutral-200 rounded flex flex-col">
            <thead className="">
                <tr className='py-2 px-3 grid grid-cols-10 gap-2 justify-items-left items-center'>
                    <th className='w-fit col-span-2'>Name</th>
                    <th className="w-fit col-span-3">Members</th>
                    <th className='w-fit col-span-2'>Member Count</th>
                    <th className='w-fit col-sapn-2'>Task Load</th>
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

// display date about team like name, members, taskload and more. 
// with button to du some operations with team
function TeamRow({ teamInfo, handleDelete, openSettings } : { teamInfo : TeamInfo, handleDelete : () => void, openSettings : () => void}) {
    const count = teamInfo.members.length;
    return (
        <tr key={teamInfo.id} className='bg-neutral-100 rounded py-2 px-3 grid grid-cols-10 gap-2 justify-items-left items-center'>
            <td className="col-span-2"><TeamBadge name={teamInfo.name} color={teamInfo.color} /></td>
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

// display image od member with title is his name
function Members({ members } : { members : TeamMemberInfo[] }) {
    const displayNum = 10;
    return (
        <td className="flex col-span-3">
            <ul className="flex gap-1">
            {
                members.slice(0, displayNum).map((member, index) => {
                    let img = "/avatar.svg"
                    if (member.image) {
                        img = `/uploads/user/${member.image}`
                    }
                    return (
                        <li key={member.id}><Image title={`${member.name} ${member.surname}`} src={img} height={30} width={30} alt="member" className="rounded-full bg-neutral-300 w-7 h-7"/></li>
                    )
                })
            }
            </ul>
        </td>
    )
}

// creator of new team
function AddDialog({ projectId, handleCloseDialog, updateTeams } : { projectId : string,  handleCloseDialog : () => void, updateTeams : () => void}) {
    const [ correct, setCorrect ] = useState<boolean>(true);
    const [ members, setMembers ] = useState<MemberInfo[]>([]); // state of all users
    const [ selected, setSelected ] = useState<MemberInfo[]>([]); // state of selected users with will be in team
    const [ msg, setMsg ] = useState<string>(""); // message displayd to user if some error occured

    // updater
    function updateSelected(members : MemberInfo[]) {
        setSelected(members);
    }

    // handle submit of form and fetch it to REST-API
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

    // init fatch of all memebrs in project
    useEffect(() => { fetchMembers() }, []);

    // fetch all members of project endpoint
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
            setMembers(data.data); 
        }
        catch (error) {
            console.error(error);
            setMsg(error as string);
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

// select component witch is handling selecting members by clicking
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

// simple display of user data in selector
function ProjectMember({ member, active, onClick } : { member : MemberInfo, active : boolean, onClick : () => void }) {
    const [ac, setAc] = useState<boolean>(active);
    let img = getImage(member.image, ImageTypes.User); 

    function handleClick() {
        setAc(!ac);
        onClick();
    }
    return (
        <li key={member.memberId} onClick={handleClick} className={`box-content flex gap-4 bg-neutral-200 rounded items-center p-1 ${ac && "outline outline-1 outline-green-500"} cursor-pointer`}>
            <Image src={img} alt="" height={15} width={15} className="rounded-full w-5 h-5"></Image>
            <p>{member.name} {member.surname}</p>
            { member.teamName && <TeamBadge name={member.teamName} color={""}/>}
        </li>
    )
}


