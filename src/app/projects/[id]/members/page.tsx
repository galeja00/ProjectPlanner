"use client"
import Image from 'next/image'
import { useEffect, useReducer, useState } from "react"
import { FilterButton, SearchInput } from '../components/filter-tables'
import { Head } from '../components/other'


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
    const [ isAddDialog, toggleDialog ] = useReducer((isAddDialog) => !isAddDialog, false);

    useEffect(() => {
        fetchMembers();
    }, [])
    
    async function fetchMembers() {
        try {
            console.log(params.id);
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
            console.log(error);
        }
    }

    function handleAddButton() {

    }

    return (
        <main className="py-14 px-14 w-3/4 mx-auto  ">
            <Head text="Members"/>
            <div className='flex gap-4 mb-4 w-full h-fit items-end'>
                <SearchInput/>
                <FilterButton/>
                <AddMemberButton handleClick={handleAddButton}/>
            </div>
            <TableMembers members={members}/>
            {
                isAddDialog ?
                    <AddDialog/>
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
            <tbody className='flex flex-col gap-1'>
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
        <tr key={memberInfo.memberId} className='bg-neutral-900 rounded m-1 grid grid-cols-5 p-2 justify-items-left items-center'>
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
    surname : string
}

function AddDialog() {
    const [ results, setResults ] = useState<UserInfo[]>([]);
    const [ type, setType ] = useState<TypeOfSearh>(TypeOfSearh.Id);
    return (
        <dialog className='absolute z-50'>
            <input></input>
        </dialog>
    )
}
