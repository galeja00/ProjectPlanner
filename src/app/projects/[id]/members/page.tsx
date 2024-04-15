"use client"
import Image from 'next/image'
import { useEffect, useReducer, useRef, useState, KeyboardEvent } from "react"
import { FilterButton, SearchInput } from '../components/filter-tables'
import { Head } from '../components/other'
import { User } from '@prisma/client'
import { ButtonWithImg } from '@/app/components/other'
import { Dialog, DialogClose } from '@/app/components/dialog'

enum Load {
    low = 1,
    mid = 2,
    high = 3
}

type MemberInfo = {
    image: string | null,
    memberId: string,
    name: string,
    position: string | null,
    teamId: string | null
    teamName: string | null,
    surname: string,
    tasksLoad: number
}

//TODO: beter structure of code and calls
export default function Members({ params } : { params : { id : string }}) {
    const [ members, setMembers] = useState<MemberInfo[]>([]);
    const [ isAddDialog, toggleDialog ] = useState<boolean>(false);
    const [ isTeamDialog, toggleTeamDialog ] = useReducer(isTeamDialog => !isTeamDialog, false);

    useEffect(() => {
        fetchMembers();
    }, [])
    
    async function fetchMembers() {
        try {
            const response = await fetch(`/api/projects/${params.id}/members`, {
                method: "GET"
            })
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            const membersInfo : MemberInfo[] = data.data;
            setMembers(membersInfo);

        }
        catch (error) { 
            console.error(error);
        }
    }

    async function removeMember(memberId : string) {
        try {
            const res = await fetch(`/api/projects/${params.id}/members/delete`, {
                method: "POST",
                body: JSON.stringify({
                    memberId: memberId
                })
            })

            const data = await res.json();
            if (res.ok) {
                const newMembres : MemberInfo[] = [];
                for (const member of members) {
                    if (memberId != member.memberId) {
                        newMembres.push(member);
                    }
                }
                setMembers(newMembres);
            }
            console.error(data.error);
        }
        catch(error) {
            console.error(error);
        }
    }

    function handleAddButton() {
        toggleDialog(!isAddDialog);
    }

    return (
        <main className="py-14 px-14 relative w-full">
            <Head text="Members"/>
            <div className='flex gap-4 mb-4 w-full h-fit items-end'>
                <SearchInput/>
                <FilterButton onClick={function (): void {
                    throw new Error('Function not implemented.')
                } }/>
                <AddMemberButton handleClick={handleAddButton}/>
            </div>
            <TableMembers members={members} handleRemove={removeMember}/>
            { isAddDialog && <AddDialog onClose={handleAddButton} id={params.id} />}
        </main>
    )
}



function AddMemberButton({ handleClick } : { handleClick : () => void}) {
    return (
        <button className='btn-primary' onClick={handleClick}>
            <Image src="/person-add.svg" alt="add-person" height={20} width={20}/>
        </button>
    )
}

function TableMembers({ members, handleRemove } : { members : MemberInfo[], handleRemove : (memberId : string) => void}) {
    function openSettings(id : string) {

    }
    return (
        <table className="bg-neutral-950 rounded flex flex-col">
            <thead className="">
                <tr className='py-2 px-3 grid grid-cols-9 justify-items-left items-center'>
                    <th className='w-fit col-span-2'>Image</th>
                    <th className='w-fit col-span-2'>Name</th>
                    <th className='w-fit col-span-2'>Team</th>
                    <th className='w-fit col-span-2'>Tasks Load</th>
                    <th></th>
                </tr>
            </thead>
            <tbody className='flex flex-col gap-1 p-1'>
                {
                    members.map((member) => (
                        <MemberRow key={member.memberId} memberInfo={member} handleRemove={() => handleRemove(member.memberId)} openSettings={() => openSettings(member.memberId)}/>
                    ))
                }
            </tbody>
        </table>
    )
}

function MemberRow({ memberInfo, handleRemove, openSettings } : { memberInfo : MemberInfo, handleRemove : () => void, openSettings : () => void }) {
    let imgSrc = "/avatar.svg"; 
    if (memberInfo.image) {
        imgSrc = `/uploads/user/${memberInfo.image}`;
    }
    return (
        <tr key={memberInfo.memberId} className='bg-neutral-900 rounded grid grid-cols-9 p-2 gap-2 justify-items-left items-center'>
            <td className='col-span-2'><Image src={imgSrc} height={20} width={20} alt="image" className='w-8 h-8 rounded-full bg-neutral-300'/></td>
            <td className='col-span-2'>{memberInfo.name} {memberInfo.surname}</td>
            <td className='col-span-2'>{memberInfo.teamName}</td>
            <MemberLoad load={memberInfo.tasksLoad}/>
            <td className='flex gap-1 justify-end col-span-1'>
                <button onClick={handleRemove} className="w-fit h-fit bg-neutral-950 rounded hover:outline hover:outline-1 hover:outline-red-600">
                        <img src="/x.svg" title="Remove User" className="w-8 h-8 hover:bg-red-600 rounded hover:bg-opacity-40"></img>
                </button>
                <button onClick={openSettings} className="w-fit h-fit bg-neutral-950 rounded hover:outline hover:outline-1 hover:outline-violet-600">
                    <img src="/settings.svg" title="Edit Team" className="w-8 h-8 p-2 rounde hover:bg-violet-600 hover:bg-opacity-40"></img>
                </button>
            </td>
        </tr>
    )
}

enum LoadColors {
    Green = "green",
    Yellow = "yellow",
    Red = "red",
    Default = "#0a0a0a"
}

enum TypeOfLoad {
    Low = "low",
    Medium = "medium",
    Heigh = "heigh"
}

type LoadDysplay = {
    text : TypeOfLoad
    color : LoadColors
    indicatorsColor : LoadColors[]
}



function convertLoadNumToDysplay(num : number) : LoadDysplay {
    var color : LoadColors;
    var text : TypeOfLoad;
    switch (num) {
        case Load.low:
            color = LoadColors.Green
            text = TypeOfLoad.Low
            break;
        case Load.mid: 
            color = LoadColors.Yellow
            text = TypeOfLoad.Medium
            break;
        default:
            color = LoadColors.Red
            text = TypeOfLoad.Heigh
    }
    const colorsOfIndicator : LoadColors[] = [];
    const numOfIndicators = 3;
    for (let i = 0; i < numOfIndicators; i++) {
        if (i < num) {
            colorsOfIndicator.push(color);
        } 
        else {
            colorsOfIndicator.push(LoadColors.Default);
        }
    }
    return { text: text, color: color, indicatorsColor : colorsOfIndicator }
}


function MemberLoad({ load } : { load : number }) {
    const res = convertLoadNumToDysplay(load);
    return (
        <td className='col-span-2'>
            <div className='' style={{ color: res.color }}>{res.text}</div>
            <div className='flex gap-1'>
                {
                    res.indicatorsColor.map((ind) => (
                        <div className='w-4 h-1 rounded' style={{ backgroundColor: ind }}></div>
                    ))
                }
            </div>
        </td>
    )
}

enum TypeOfSearh {
    Id = "id",
    Name = "name"
}

type UserInfo = {
    id : string,
    name : string,
    surname : string,
    image : string
}

function AddDialog({onClose, id } : { onClose : () => void, id : string }) {
    const [ results, setResults ] = useState<UserInfo[]>([]);
    const [ type, setType ] = useState<TypeOfSearh>(TypeOfSearh.Id);
    //const [ value, setValue ] = useState<String>("");
    const typesOfSearh = [ TypeOfSearh.Id, TypeOfSearh.Name ]

    async function searchUser(value : string) {
        try {
            const res = await fetch("/api/users/search", {
                method: "POST",
                body: JSON.stringify({
                    type: type,
                    value: value
                })
            })

            const data = await res.json();
            if (!res.ok) {
                throw new Error();
            }

            setResults(data.users);

        } catch (error) {
            //console.error(error);
            console.error(error);
        }
    }

    return (
        <Dialog>
            <search className='p-4 relative h-2/3 w-1/3 bg-neutral-950 rounded flex flex-col gap-4'>
                <DialogClose handleClose={onClose}/>
                <AddForm actualType={type} types={typesOfSearh} search={searchUser}/>
                <ListUsers users={results} id={id}/>
            </search>
        </Dialog>
    )
}

function AddForm({ actualType, types, search } : { actualType : TypeOfSearh, types : TypeOfSearh[], search : (value : string) => void }) {
    function handleKeyDown(event :  KeyboardEvent<HTMLInputElement>) {
        const inputValue = event.currentTarget.value;
        if (inputValue.length > 0) {
            search(inputValue);
        }
    }

    return (
        <div>
            <div className='flex'>
                {
                    types.map((t) => (
                        <label className="rounded-t px-4 py-1 flex content-center" style={{ backgroundColor: t == actualType ? "#171717" : "#0a0a0a"}}>{t}</label>
                    ))
                }
            </div>
            <div className='py-2 px-4 bg-neutral-900 rounded-tr rounded-br rounded-bl w-full'>
                <input className="bg-neutral-900 focus:outline focus:outline-2 focus:outline-none border-b border-neutral-950 w-full" type="text" onKeyDown={handleKeyDown}></input>
            </div>
        </div>
    )
}

function ListUsers({ users, id } : { users : UserInfo[], id : string }) {
    return (
        <ul className='space-y-2'>
            {
                users.map((user) => (
                    <UsersItem user={user} id={id}/>
                ))
            }
        </ul>
    )
}

function UsersItem({ user, id } : { user : UserInfo, id : string }) {
    const [notif, toggle] = useReducer(notif => !notif, false);

    async function inviteUser() {
        try {
            const res = await fetch(`/api/projects/${id}/members/add`, {
                method: "POST",
                body: JSON.stringify({
                    userId: user.id,
                })
            })

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.eror);
            }

            console.log(data.message)
            //TODO: Notification of succes
        } 
        catch (error) {
            console.error(error);
        }
    }

    return (
        <li key={user.id} className='bg-neutral-900 rounded p-2 flex w-full'>
            <Image src="/avatar.svg" alt="avater" width={2} height={2} className='w-8 h-8 rounded-full bg-neutral-300 mr-5 text-color cursor-pointer'></Image>
            <div className='w-full'>{user.name} {user.surname}</div>
            <div className='flex w-full flex-row-reverse'>
                <button className='btn-primary' onClick={inviteUser}>Send</button>
            </div>
        </li>
    )
}
