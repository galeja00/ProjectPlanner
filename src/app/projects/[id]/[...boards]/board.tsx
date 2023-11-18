'use client'
import { Tag, Task } from '@prisma/client'
import Image from 'next/image' 
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useReducer, useState, KeyboardEvent } from 'react'


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
                throw new Error("");
            }
            setTaskColumns(json.data);
            
        }
        catch (Error) {
            console.log(Error);
        }
    }


    return (
        <TasksColumnsContext.Provider value={{ tasksColumns, setTaskColumns }}>
            <section className='flex gap-4 mb-4 w-fit h-fit items-end'>
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
    return (
        <div className='flex flex-col gap-2'>
            <label>Search</label>
            <input name="search" className='border rounded text-neutral-950 focus:outline focus:outline-2 focus:outline-violet-500'></input>
        </div>
    )
}

function FilterBoard() {
    return (
        <div className='w-fit'>
            <button className='btn-primary'>Filter</button>
        </div>
    )
}


function TasksColumn({ index, projectId } : { index : number, projectId : string }) {
    const [ creating, toggle ] = useReducer((creating : boolean) => !creating, false);
    const { tasksColumns: tasksColumns } = useContext(TasksColumnsContext);
    const [ tasksCol , setTasksCol ] = useState<BoardTasksColumn>(tasksColumns[index]);
    
    function handleCreateTaskForm() {
        toggle();
    }

    async function createTask(name : string) {
        try {
            const colId = tasksCol.id;
            const response = await fetch(`/api/projects/${projectId}/board/task/add`, {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    colId: colId
                })
            });
            
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json.error);
            }
            
            const newTask : Task = json.task;
            const newTasks : Task[] = tasksCol.tasks;
            newTasks.push(newTask);
            toggle();
            setTasksCol({ id: tasksCol.id, boardId: tasksCol.id, name: tasksCol.name, num: tasksCol.num, tasks: newTasks });
            
        }
        catch (error) {
            console.log(error);
        }
    }

    // TODO: api for delete and remove (remove delete from full project, removu only from board)
    async function deleteTask(id : string) {
        try {
            const response = await fetch(`/api/projects/${projectId}/board/task/delete`, {
                method: "POST",
                body: JSON.stringify({
                    id: id
                })
            });

            if (!response.ok) {
                throw new Error();
            }

            const data = await response.json();
            const newTasks : Task[] = data.tasks;
            setTasksCol({ id: tasksCol.id, boardId: tasksCol.id, name: tasksCol.name, num: tasksCol.num, tasks: newTasks });
        }
        catch (error) {
            console.log(error);
        }
    }

    async function removeTask( id : string ) {
        try {

        } catch (error) {

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
                        tasksCol.tasks.map((task) => (
                            <Task key={task.id} task={task} deleteTask={() => deleteTask(task.id)} removeTask={() => removeTask(task.id)} />
                    ))
                    }
                    {   
                        creating ? 
                            <CreatorOfTask key={"create"} createTask={createTask}/>
                            :
                            <li></li>
                    }
                </ul>
                <CreateTaskButton createTask={() => handleCreateTaskForm()}/>
            </div>
        </section>
    )
}

type MoreMenuItem = {
    name: string,
    handler: () => void
}

function Task({ task, removeTask, deleteTask } : { task : Task, removeTask : () => void, deleteTask : () => void }) {
    const [ isMenu, toggleMenu ] = useReducer((isMenu) => !isMenu, false);
    function displayMoreMenu() {
        toggleMenu();
    }

    function displayInfo() {

    }

    function moveTask() {

    }

    
    const MoreMenuItems : MoreMenuItem[] = [
        { name: "Move To", handler: moveTask },
        { name: "Info", handler: displayInfo },
        { name: "Remove", handler: removeTask },
        { name: "Delete", handler: deleteTask },
    ]
    return (
        <li className="rounded bg-neutral-900 p-2 flex flex-col gap-2 relative">
            <div className='flex w-full items-center justify-between '>
                <Name name={task.name}/>
                <MoreButton handleClick={() => displayMoreMenu()}/>
                {
                    isMenu ? <MoreMenu items={MoreMenuItems}/> : <></>
                }
            </div>
            <TagList/>
            <div className='flex flex-row-reverse'>
                <Solvers/>
            </div>
        </li>
    )
}

function TaskInfo({ task } : { task : Task }) {

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
        <button className='w-fit h-fit rounded-full hover:bg-neutral-950 p-1'>
            <Image src="/avatar.svg" alt="avatar" width={2} height={2} className='w-6 h-6 rounded-full bg-neutral-300 cursor-pointer'></Image>
        </button>    
    )
}

function AddTaskColumn() {
    return (
        <button className='w-fit h-fit'>
            <Image src="/plus.svg" alt="avatar" width={2} height={2} className='w-7 h-7 rounded bg-neutral-950 cursor-pointer'></Image>
        </button>
    )
}

function Name({ name } : { name : string}) {
    return (
        <div className='flex gap-2'>
            <h3>{name}</h3>
            <button className='w-fit h-fit rounded hover:bg-neutral-950 p-1' title="edit name">
                <Image src="/pencil.svg" alt="more" width={2} height={2} className='w-5 h-5 rounded-full cursor-pointer'></Image>
            </button>
        </div>
    )
}

function MoreButton({ handleClick } : { handleClick : () => void}) {
    return (
        <button className='w-fit h-fit rounded hover:bg-neutral-950 p-1'>
            <Image src="/more.svg" alt="more" width={2} height={2} onClick={handleClick} className='w-5 h-5 rounded-full cursor-pointer'></Image>
        </button>
    )
}


function MoreMenu({ items } : { items : MoreMenuItem[] }) {
    return (
        <ul className='absolute w-28 bg-neutral-950 rounded p-2 border border-neutral-400 right-0 top-10 z-50'>
            {
                items.map((item) => (
                    <MoreMenuIteam key={item.name} name={item.name} handleClick={item.handler}/>
                ))
            }
        </ul>
    )
}

function MoreMenuIteam({ name, handleClick } : { name : string, handleClick : () => void }) {
    return (
        <li>
            <button className='link-secundary h-6'>{name}</button>
        </li>
    )
}

