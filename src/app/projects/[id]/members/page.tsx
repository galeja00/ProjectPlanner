"use client"
import Image from 'next/image'
import { useEffect, useReducer, useRef, useState, KeyboardEvent } from "react"
import { FilterButton, SearchInput } from '../components/filter-tables'
import { Head } from '../components/other'
import { User } from '@prisma/client'


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
    seniority: string | null,
    surname: string,
    tasksLoad: number
}


export default function Members({ params } : { params : { id : string }}) {
    const [ members, setMembers] = useState<MemberInfo[]>([]);
    const [ isAddDialog, toggleDialog ] = useState<boolean>(false)

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

    function handleAddButton() {
        toggleDialog(!isAddDialog);
    }

    return (
        <main className="py-14 px-14 relative w-full">
            <Head text="Members"/>
            <div className='flex gap-4 mb-4 w-full h-fit items-end'>
                <SearchInput/>
                <FilterButton/>
                <AddMemberButton handleClick={handleAddButton}/>
            </div>
            <TableMembers members={members}/>
            {
                isAddDialog ?
                    <AddDialog onClose={handleAddButton} id={params.id} />
                    :
                    <></>
            }
        </main>
    )
}

function AddMemberButton({ handleClick } : { handleClick : () => void}) {
    return (
        <button className='btn-primary' onClick={handleClick}>
            <Image src="/person-fill-add.svg" alt="add-person" height={20} width={20}/>
        </button>
    )
}

function TableMembers({ members } : { members : MemberInfo[] }) {
    return (
        <table className="bg-neutral-950 rounded flex flex-col">
            <thead className="">
                <tr className='py-2 px-3 grid grid-cols-5 justify-items-left items-center'>
                    <th className='w-fit'>Image</th>
                    <th className='w-fit'>Name</th>
                    <th className='w-fit'>Position</th>
                    <th className='w-fit'>Senority</th>
                    <th className='w-fit'>Tasks Load</th>
                </tr>
            </thead>
            <tbody className='flex flex-col gap-1 p-1'>
                {
                    members.map((member) => (
                        <MemberRow memberInfo={member}/>
                    ))
                }
            </tbody>
        </table>
    )
}

function MemberRow({ memberInfo } : { memberInfo : MemberInfo }) {
    return (
        <tr key={memberInfo.memberId} className='bg-neutral-900 rounded grid grid-cols-5 p-2 justify-items-left items-center'>
            <td><Image src={memberInfo.image ? memberInfo.image : "/avatar.svg"} height={20} width={20} alt="image" className='w-6 h-6 rounded-full bg-neutral-300'/></td>
            <td>{memberInfo.name} {memberInfo.surname}</td>
            <td>{memberInfo.position}</td>
            <td>{memberInfo.seniority}</td>
            <MemberLoad load={memberInfo.tasksLoad}/>
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
        <td>
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
        <dialog className='absolute z-50 flex bg-neutral-950 bg-opacity-60 left-0 top-0 w-full h-full text-neutral-100 justify-center items-center'>
            <search className='p-4 relative h-2/3 w-1/3 bg-neutral-950 rounded flex flex-col gap-4'>
                <AddForm actualType={type} types={typesOfSearh} search={searchUser}/>
                <ListUsers users={results} id={id}/>
                <button className='btn-primary h-fit w-fit absolute right-4 bottom-4' onClick={onClose}>Close</button>
            </search>
        </dialog>
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
        <ul>
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
