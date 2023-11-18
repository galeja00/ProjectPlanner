'use client'
import { Tag, Task } from '@prisma/client'
import Image from 'next/image' 
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useReducer, useState, KeyboardEvent } from 'react'

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

type ProviderColumns = {
    tasksColumns: BoardTasksColumn[];
    setTaskColumns: Dispatch<SetStateAction<BoardTasksColumn[]>>;
}
// TODO: vyresit problem pokud dany Context se dostane do dalsich komponenet
const TasksColumnsContext = createContext<ProviderColumns>(({
    tasksColumns: [],
    setTaskColumns: () => {},
  }));

export default function Board({ id } : { id : string }) {
    const [ tasksColumns, setTaskColumns ] = useState<BoardTasksColumn[]>([]);

    useEffect(() => {
        getColumns(id);
    }, [])

    async function getColumns(id : string) : Promise<void> {
        try {
            const response = await fetch(`/api/projects/${id}/board`, {
                method: "GET"
            })
            if (!response.ok) {
                const data = await response.json();
                console.log(data.error);
            }

            const json = await response.json();

            if (!json.data) {
                console.log(json);
                throw new Error("");
            }
            console.log(json.data);
            setTaskColumns(json.data);
            
        }
        catch (Error) {
            console.log(Error);
        }
    }


    return (
        <TasksColumnsContext.Provider value={{ tasksColumns, setTaskColumns }}>
            <section>
                <SeacrhBoard/>
                <FilterBoard/>
            </section>
            <section className="flex gap-2 w-full">
                {
                    tasksColumns.map((col, index) => (
                        <TasksColumn key={col.id} index={index} projectId={id}/>
                        
                    ))
                }
                <AddTaskColumn/>
            </section>
        </TasksColumnsContext.Provider>
    )
}

function SeacrhBoard() {
    return <></>
}

function FilterBoard() {
    return <></>
}


// TODO: refactor name of functions, and add json type safty
function TasksColumn({ index, projectId } : { index : number, projectId : string }) {
    const [ creating, toggle ] = useReducer((creating : boolean) => !creating, false);
    const { tasksColumns: tasksColumns, setTaskColumns: setTaskColumns } = useContext(TasksColumnsContext);
    const [ tasksCol , setTasksCol ] = useState<BoardTasksColumn>(tasksColumns[index]);
    
    function handleCreateTaskForm() {
        toggle();
        console.log(creating);
    }

    async function createTask(name : string) {
        try {
            const colId = tasksCol.id;
            const response = await fetch(`/api/projects/${projectId}/board/add-task`, {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    colId: colId
                })
            });
            
            const json = await response.json();
            console.log(json);
            if (!response.ok) {
                throw new Error(json.error);
            }
            
            
            const newTask : Task = json.task;
            const newTasks : Task[] = tasksCol.tasks;
            newTasks.push(newTask);
            toggle();
            setTasksCol({ id: tasksCol.id, boardId: tasksCol.id, name: tasksCol.name, num: tasksCol.num, tasks: newTasks});
            
        }
        catch (error) {
            console.log(error);
        }
    }
        

    return (
        <section className="bg-neutral-950 rounded w-80 h-fit">
            <div className="p-2 border-b border-neutral-400">
                <h2 className="">{tasksCol.name}</h2>
            </div>
            <div className="p-2">
                <ul className="flex flex-col gap-2 mb-2">
                    {   
                        creating ? 
                        <CreatorOfTask createTask={createTask}/>
                        :
                        <></>
                    }
                    { 
                        tasksCol.tasks.map((task) => (
                            <Task key={task.id} task={task} />
                    ))}
                </ul>
                <CreateTaskButton createTask={() => handleCreateTaskForm()}/>
            </div>
        </section>
    )
}

function Task({ task } : { task : Task }) {
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
    const [tags, setTags] = useState<Tag[]>([]);
    const [adding, toggle] = useReducer(adding => !adding, false);

    function addTag() {
        toggle();
    }

    return (
        <div>
            <div className='flex'>
            <ul>
                {
                    tags.map((tag) => (
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

function CreatorOfTask({ createTask } : { createTask: (text : string) => void }) {
    function handleKeyDown(event :  KeyboardEvent<HTMLInputElement>) {
        const inputValue = event.currentTarget.value;
        if (event.key === 'Enter') {
            if (inputValue.length > 0) {
                createTask(inputValue);
            }
        }
    }

    return (
        <li className="rounded bg-neutral-900 p-2 flex flex-col gap-2">
            <input type="text" className="bg-neutral-900" id="name" onKeyDown={handleKeyDown}></input>
        </li>
    )
}


function CreateTaskButton({ createTask } : { createTask : () => void }) {
    return (
        <div className='flex items-center gap-2'>
            <button onClick={createTask}>
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
            <Image src="/plus.svg" alt="avatar" width={2} height={2} className='w-6 h-6 rounded bg-neutral-950 cursor-pointer'></Image>
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

