"use client"
import { useState, useEffect, useReducer } from "react";
import { FilterButton, SearchInput } from "../components/filter-tables";
import { CreateTaskButton, Head } from "../components/other";
import { GroupOfTasks } from "@/app/api/projects/[id]/[board]/route";
import { Task } from "@prisma/client";
import { Solver } from "@/app/api/projects/[id]/task/[taskId]/[func]/route";
import Image from 'next/image' 
import { TaskInfo } from "../components/task-info";
import { PriorityText } from "./components/priority";



export default function Backlog({ id } : { id : string }) {
    const [groups, setGroups] = useState<GroupOfTasks[]>([]); 
    async function fetchGroups() {
        try {
            const res = await fetch(`/api/projects/${id}/backlog`, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                console.error(data.error);
                return;
            }
            console.log(data.data);
            setGroups(data.data);
        }
        catch (error) {
            console.error(error);
        }
    }

    

    useEffect(() => {
        fetchGroups()
    }, [])
    return (
        <div className="w-3/4 mx-auto">
            <Head text="Backlog"/>
            <section className='flex gap-4 mb-4 w-fit h-fit items-end'>
                <SearchInput/>
                <FilterButton onClick={() => fetchGroups}/>
            </section>
            <ListOfGroups groups={groups} />
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

function ListOfGroups({ groups } : { groups : GroupOfTasks[]}) {
    function createGroup() {

    }

    function handleOnDragTask() {

    }

    function handleOnDragGroup() {

    }
    return (
        <section className="w-full">
            <GroupCreate createGroup={createGroup}/>
            <ul className="space-y-4 w-full" draggable onDragStart={handleOnDragGroup}>
                {
                    groups.map((group) => (
                        <GroupList group={group} handleOnDrag={handleOnDragTask}/>
                    ))
                }
            </ul>
        </section>
    )
}

function GroupList({ group, handleOnDrag } : { group : GroupOfTasks, handleOnDrag : (task : Task , group : GroupOfTasks) => void}) {
    function createTask() {

    }


    return (
        <li className="bg-neutral-950 w-full rounded p-2 space-y-2">
            <h2>{group.name}</h2>
            <ul className="space-y-2">
                {
                    group.tasks.map((task) => (
                        <GroupTask task={task} handleOnDrag={() => handleOnDrag(task, group)}/>
                    ))
                }
            </ul>
            <CreateTaskButton createTask={createTask}/>
        </li> 
    )
}

type ColumnInfo = {
    id: string,
    name: string
}

function GroupTask({ task, handleOnDrag } : {task : Task, handleOnDrag : () => void }) {
    const [ isInfo, toggleInfo ] = useReducer(isInfo => !isInfo, false);
    const [ solvers, setSolvers ] = useState<Solver[]>([]);
    const [ colInfo, setColInfo ] = useState<ColumnInfo | null>(null);
    async function fetchSolvers() {
        try {
            const res = await fetch(`/api/projects/${task.projectId}/task/${task.id}/solver`, {
                method: "GET"
            })
            if (!res.ok) {
                fetchSolvers();
            }
            const data = await res.json();
            if (!data.solvers) {
                throw new Error();
            }
            setSolvers(data.solvers);
        }
        catch (error) {
            console.error(error);
        }
    }

    async function fetchColumnInfo() {
        try {

        }
        catch (error) {
            console.error(error)
        }
    }

    function updateTask(task : Task) {

    }

    useEffect(() => {
        fetchSolvers();
        fetchColumnInfo();
    }, [])
    return (
        <>
            <li className="bg-neutral-900 w-full p-2 rounded grid  grid-cols-10 gap-2" draggable onDragStart={handleOnDrag}>
                <h3 className="col-span-3">{task.name}</h3>
                <ColInfo col={colInfo}/>
                <div className="col-span-2 flex items-center">{ task.priority &&<PriorityText priority={task.priority}/>}</div>
                <ul className="flex gap-1 h-full items-center col-span-2">
                    {
                        solvers.map((solver) => (
                            <SolverComp solver={solver}/>
                        ))
                    }
                </ul>
                <div className="flex h-full items-center justify-end gap-1 col-span-1">
                    <button  className="w-fit h-fit bg-neutral-950 rounded hover:outline hover:outline-1 hover:outline-red-600">
                            <img src="/trash.svg" title="Delete Task" className="w-8 h-8 p-2 hover:bg-red-600 rounded hover:bg-opacity-40"></img>
                    </button>
                    { task.tasksGroupId && 
                    <button  className="w-fit h-fit bg-neutral-950 rounded hover:outline hover:outline-1 hover:outline-orange-600">
                        <img src="/x.svg" title="Remove Task" className="w-8 h-8 hover:bg-orange-600 rounded hover:bg-opacity-40"></img>
                    </button>
                    }
                    <button  className="w-fit h-fit bg-neutral-950 rounded hover:outline hover:outline-1 hover:outline-violet-600">
                        <img src="/info-lg.svg" title="Task Info" className="w-8 h-8 p-2 rounde hover:bg-violet-600 hover:bg-opacity-40"></img>
                    </button>
                </div>
            </li>
            {isInfo && <TaskInfo id={task.id} projectId={task.projectId} handleClose={toggleInfo} submitTask={updateTask}/>}
        </>
    )
}

function SolverComp({ solver } : { solver : Solver }) {
    const imgSrc = solver.image ? `/uploads/user/${solver.image}` : "/avatar.svg";
    return ( 
        <li key={solver.id}>
            <Image alt="Image" src={imgSrc} width={30} height={30} title={`${solver.name} ${solver.name}`} className="rounded-full bg-neutral-300"></Image>
        </li>
    )
}


function ColInfo({ col } : { col : ColumnInfo | null }) {
    let text = "undefined";
    if (col) {
        text = col.name
    }
    return (
        <div className="flex items-center col-span-2">{text}</div>
    )
}