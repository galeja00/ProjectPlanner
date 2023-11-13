'use client'
import { Tag, Task } from '@prisma/client'
import { ExecFileSyncOptionsWithBufferEncoding } from 'child_process'
import Image from 'next/image' 
import { useEffect, useReducer, useState } from 'react'

/*
textovaci constanty
<TaskColumn name="Todo"></TaskColumn>
<TaskColumn name="InWork"></TaskColumn>
<TaskColumn name="Done"></TaskColumn>
*/

type BoardTasksColumn = {
    id : string,
    boardId: string,
    name : string,
    num : number,
    tasks : Task[]
}

export default function Board({ id } : { id : string }) {
    const [ tasksColumns, setTaskColumns ] = useState<BoardTasksColumn[]>([]);

    useEffect(() => {
        getColumns(id);
    }, [])


    async function getColumns(id : string) : Promise<void> {
        try {
            console.log(id);
            const response = await fetch(`/api/projects/${id}/board`, {
                method: "GET"
            })
            if (!response.ok) {
                const data = await response.json();
                console.log(data.error);
            }

            const json = await response.json();

            console.log(json);

            if (!json.data) {
                console.log(json)
            }

            setTaskColumns(json.data);
        }
        catch (Error) {
            console.log(Error);
        }
    }

    return (
        <section className="flex gap-2 w-full">
            {
                tasksColumns.map((col) => (
                    <TaskColumn key={col.id} name={col.name}></TaskColumn>
                ))
            }
            <AddTaskColumn></AddTaskColumn>
        </section>
    )
}

function TaskColumn({ name } : { name : string }) {
    const [tasks, setTasks] = useState<Task[]>([]); 

    return (
        <section className="bg-neutral-950 rounded w-80 h-fit">
            <div className="p-2 border-b border-neutral-400">
                <h2 className="">{name}</h2>
            </div>
            <div className="p-2">
                <ul className="flex flex-col gap-2 mb-2">
                    { tasks.map( (task) => (
                        <TaskItem key={task.id} task={task}></TaskItem>
                    ))}
                </ul>
                <AddTask/>
            </div>
        </section>
    )
}

function TaskItem({ task } : { task : Task }) {
    return (
        <li className="rounded bg-neutral-900 p-2 flex flex-col gap-2">
            <div className='flex w-full items-center justify-between'>
                <Name name={task.name}/>
                <More/>
            </div>
            <TagList/>
            <div className='flex flex-row-reverse'>
                <Solvers/>
            </div>
        </li>
    )
}



function TagList() {
    // TODO: Tags and ags type
    const [tags, setTags] = useState<Tag[]>();
    const [adding, toggle] = useReducer(adding => !adding, false);

    function addTag() {
        toggle();
    }

    return (
        <div>
            <div className='flex'>
            <ul>
                {
                    tags?.map((tag) => (
                        <li className='p-1'>{tag.name}</li>
                    ))
                }
            </ul>
            { adding ?
                <form>
                    <input></input>
                    <button></button>
                </form>
                :
                <button onClick={addTag}><Image src="/plus.svg" width={20} height={20} alt="add"></Image></button>
            }
            </div>   
        </div>
    )
}




function AddTask() {
    return (
        <div className='flex items-center gap-2'>
            <button >
                <Image src="/plus.svg" alt="add task" width={2} height={2} className='w-7 h-7 rounded bg-neutral-900 cursor-pointer hover:bg-violet-800'></Image>
            </button>
            <p className='text-neutral-400 text-sm'>Create new task</p>
        </div>
    )
}

function Solvers() {
    return (
        <div>
            <Image src="/avatar.svg" alt="avatar" width={2} height={2} className='w-6 h-6 rounded-full bg-neutral-300 cursor-pointer'></Image>
        </div>    
    )
}

function AddTaskColumn() {
    return (
        <button>
            <Image src="/plus.svg" alt="avatar" width={2} height={2} className='w-6 h-full rounded bg-neutral-950 cursor-pointer'></Image>
        </button>
    )
}

function Name({ name } : { name : string}) {
    return (
        <div className='flex gap-2'>
            <h3>{name}</h3>
            <button><Image src="/pencil.svg" alt="more" width={2} height={2} className='w-5 h-5 rounded-full cursor-pointer'></Image></button>
        </div>
    )
}

function More() {
    return (
        <button>
            <Image src="/more.svg" alt="more" width={2} height={2} className='w-5 h-5 rounded-full cursor-pointer'></Image>
        </button>
        
    )
}

