"use client"
import { useState } from "react";
import { FilterButton, SearchInput } from "../components/filter-tables";
import { CreateTaskButton, Head } from "../components/other";

type Group = {

}

export default function Backlog({ id } : { id : string }) {
    const [groups, setGroups] = useState<Group[]>([]); 
    async function fetchGroups() {
        try {
            const res = await fetch(`/api/projects/${id}/`, {
                method: "GET"
            })
        }
        catch (error) {

        }
    }

    return (
        <div className="w-2/3 mx-auto">
            <Head text="Backlog"/>
            <section className='flex gap-4 mb-4 w-fit h-fit items-end'>
                <SearchInput/>
                <FilterButton onClick={() => fetchGroups}/>
            </section>
            <ListOfGroups groups={groups}/>
        </div>
        
    )
}

function GroupCreate({ createGroup } : { createGroup : () => void}) {
    return (
        <button onClick={createGroup} className="flex gap-2 items-center mb-2 text-neutral-400">
            <img src="/plus.svg" className="w-8 h-8 bg-neutral-950 rounded"/>
            <div>Create new group</div>
        </button>
    )
}

function ListOfGroups({ groups } : { groups : Group[] }) {
    function createGroup() {

    }


    return (
        <section className="w-full">
            <GroupCreate createGroup={createGroup}/>
            <ul className="space-y-4 w-full">
                <GroupList/>
                <GroupList/>
                <GroupList/>
            </ul>
        </section>
    )
}

function GroupList() {
    function createTask() {

    }

    return (
        <li className="bg-neutral-950 w-full rounded p-2 space-y-2">
            <h2>Name Of Group</h2>
            <ul className="space-y-2">
                <GroupTask/>
            </ul>
            <CreateTaskButton createTask={createTask}/>
        </li> 
    )
}


function GroupTask() {
    return (
        <li className="bg-neutral-900 w-full p-2 rounded">
            <h3>tohle je dokonala taska</h3>
        </li>
    )
}