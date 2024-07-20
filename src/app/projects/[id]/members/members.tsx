"use client"
import Image from 'next/image'
import { useEffect, useReducer, useRef, useState, KeyboardEvent } from "react"
import { Head } from '../components/other'
import { Dialog, DialogClose } from '@/app/components/dialog'
import { InitialLoader } from '@/app/components/other-client'
import { ErrorBoundary, ErrorState, useError } from '@/app/components/error-handler'


// type for a member 
type MemberInfo = {
    image: string | null,
    memberId: string,
    name: string,
    teamId: string | null
    teamName: string | null,
    surname: string,
    tasksLoad: number
}
//componenets for displaying data about users with are project memebers
export default function Members({ id } : { id : string}) {
    const [ members, setMembers] = useState<MemberInfo[]>([]); 
    const [ isAddDialog, toggleDialog ] = useState<boolean>(false); // state if is adding dialog on or of
    const [ initialLoading, setInitialLoading ] = useState<boolean>(false); // state of loading for loading circle
    const { submitError } = useError();
   
    //initial fetch of members data
    useEffect(() => {
        fetchMembers();
    }, [])
    
    // function for fetching data of members in project
    async function fetchMembers() {
        setInitialLoading(true);
        try {
            const response = await fetch(`/api/projects/${id}/members`, {
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
            submitError(error, fetchMembers);
        }
        finally {
            setInitialLoading(false);
        }
    }

    // async function for fecthiong to endpoint and deleting member from project
    async function removeMember(memberId : string) {
        try {
            const res = await fetch(`/api/projects/${id}/members/remove`, {
                method: "POST",
                body: JSON.stringify({
                    memberId: memberId
                })
            })


            if (res.ok) {
                const newMembres : MemberInfo[] = [];
                for (const member of members) {
                    if (memberId != member.memberId) {
                        newMembres.push(member);
                    }
                }
                setMembers(newMembres);
            } else {
                const data = await res.json();
                throw new Error(data.error);
            }
            
        }
        catch(error) {
            console.error(error);
            submitError(error, () => removeMember(memberId));
        }
    }

    function handleAddButton() {
        toggleDialog(!isAddDialog);
    }


    return (
        <main className="py-14 px-14 relative w-full">
                <Head text="Members"/>
                <section className='flex gap-4 mb-4 w-full h-fit items-end'>

                    <AddMemberButton handleClick={handleAddButton}/>
                </section>
                <section>
                {
                    initialLoading ? 
                        <InitialLoader/>
                        :
                        <TableMembers members={members} handleRemove={removeMember}/>
                }
                </section>
                { isAddDialog && <AddDialog onClose={handleAddButton} id={id} />}
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

// display table head and map rows where rows are members of project
function TableMembers({ members, handleRemove } : { members : MemberInfo[], handleRemove : (memberId : string) => void}) {
    return (
        <table className="bg-neutral-200 rounded flex flex-col">
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
                        <MemberRow key={member.memberId} memberInfo={member} handleRemove={() => handleRemove(member.memberId)}/>
                    ))
                }
            </tbody>
        </table>
    )
}

// display data about member of project and cliceble button
function MemberRow({ memberInfo, handleRemove } : { memberInfo : MemberInfo, handleRemove : () => void }) {
    let imgSrc = "/avatar.svg"; 
    if (memberInfo.image) {
        imgSrc = `/uploads/user/${memberInfo.image}`;
    }
    return (
        <tr key={memberInfo.memberId} className='bg-neutral-100 rounded grid grid-cols-9 p-2 gap-2 justify-items-left items-center'>
            <td className='col-span-2'><Image src={imgSrc} height={20} width={20} alt="image" className='w-8 h-8 rounded-full bg-neutral-400'/></td>
            <td className='col-span-2'>{memberInfo.name} {memberInfo.surname}</td>
            <td className='col-span-2'>{memberInfo.teamName}</td>
            <td className='col-span-2'>{memberInfo.tasksLoad}</td>
            <td className='flex gap-1 justify-end col-span-1'>
                <button onClick={handleRemove} className="w-fit h-fit bg-neutral-200 rounded hover:outline hover:outline-1 hover:outline-red-600">
                        <img src="/x.svg" title="Remove User" className="w-8 h-8 hover:bg-red-600 rounded hover:bg-opacity-40"></img>
                </button>
            </td>
        </tr>
    )
}

// types for searching user in application to add them to project
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

// dialog for searching users in application 
function AddDialog({ onClose, id } : { onClose : () => void, id : string }) {
    const [ results, setResults ] = useState<UserInfo[]>([]); // results from sreach
    const [ type, setType ] = useState<TypeOfSearh>(TypeOfSearh.Id); // state of sreach type
    const typesOfSearh = [ TypeOfSearh.Id, TypeOfSearh.Name ]; 
    const { submitError } = useError();
    // search users by snyc cominication with enpoint
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
            console.error(error);
            submitError(error, () => searchUser(value));
        }
    }

    // handle change of search type
    function handleChange(type : TypeOfSearh) {
        setType(type);
    }

    return (
        <Dialog>
            <search className='p-4 relative h-2/3 w-1/3 bg-neutral-200 rounded flex flex-col gap-4 '>
                <DialogClose handleClose={onClose}/>
                <AddForm actualType={type} types={typesOfSearh} search={searchUser} handleChange={handleChange}/>
                <ListUsers users={results} id={id}/>
            </search>
        </Dialog>
    )
}

// display inputs to user for search users
function AddForm(
    { actualType, types, search, handleChange } : 
    { actualType : TypeOfSearh, types : TypeOfSearh[], search : (value : string) => void, handleChange : (t : TypeOfSearh) => void }) {
    
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
                    types.map((t, i) => (
                        <label key={i} onClick={() => handleChange(t)} className="rounded-t px-4 py-1 flex content-center" style={{ backgroundColor: t == actualType ? "#f4f4f5" : "#e4e4e7"}}>{t}</label>
                    ))
                }
            </div>
            <div className='py-2 px-4 bg-neutral-100 rounded-tr rounded-br rounded-bl w-full'>
                <input className="bg-neutral-100 focus:outline focus:outline-2 focus:outline-none border-b border-neutral-200 w-full" type="text" onKeyDown={handleKeyDown}></input>
            </div>
        </div>
    )
}

// display all finded users
function ListUsers({ users, id } : { users : UserInfo[], id : string }) {
    return (
        <ul className='space-y-2 overflow-y-auto'>
            {
                users.map((user) => (
                    <UsersItem key={user.id} user={user} id={id}/>
                ))
            }
        </ul>
    )
}

// info about user and function to invite it
function UsersItem({ user, id } : { user : UserInfo, id : string }) {
    const { submitError } = useError();
    // contact endpoint by fetching to invite user and create notification for him
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
        } 
        catch (error) {
            console.error(error);
            submitError(error, inviteUser);
        }
    }

    return (
        <li key={user.id} className='bg-neutral-100 rounded p-2 flex w-full'>
            <Image src="/avatar.svg" alt="avater" width={2} height={2} className='w-8 h-8 rounded-full bg-neutral-400 mr-5 text-color cursor-pointer'></Image>
            <div className='w-full'>{user.name} {user.surname}</div>
            <div className='flex w-full flex-row-reverse'>
                <button className='btn-primary' onClick={inviteUser}>Send</button>
            </div>
        </li>
    )
}