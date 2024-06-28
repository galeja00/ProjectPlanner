'use client'
import { Tag, Task, Team } from '@prisma/client'
import Image from 'next/image' 
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useReducer, useState, KeyboardEvent, useRef } from 'react'
import { FilterButton, FilterDialog, SearchInput } from '../components/filter-tables'
import { TaskInfo } from '../components/task-info'
import { Head, CreateTaskButton } from '../components/other'
import { useRouter } from 'next/router';
import { pathToImages } from '@/config'
import { PriorityImg } from './components/priority'
import { Creator, CreatorOfTask } from './components/creator'

type BoardTasksColumn = {
    id : string,
    boardId: string,
    name : string,
    tasks : Task[]
}

type ProviderColumns = {
    tasksColumns: BoardTasksColumn[];
    setTaskColumns: Dispatch<SetStateAction<BoardTasksColumn[]>>;
}

type MoveTaskInfo = {
    fromColId: string,
    toColId: string,
    taskId: string,
    taskIndex: number
}

const TasksColumnsContext = createContext<ProviderColumns>(({
    tasksColumns: [],
    setTaskColumns: () => {},
  }));

export default function Board({ id } : { id : string }) {
    const [ tasksColumns, setTaskColumns ] = useState<BoardTasksColumn[]>([]);
    const [ isFilterDialog, toggleFilterDialog ] = useReducer(isFilterDialog => !isFilterDialog, false);
    //const router = useRouter();
    //const { filter, sort } = router.query;

    useEffect(() => {
        fetchColumns(id);
    }, [])

    async function fetchColumns(id : string) : Promise<void> {
        try {
            const response = await fetch(`/api/projects/${id}/board`, {
                method: "GET"
            })
            const data = await response.json();
            if (!response.ok) {
                console.error(data.error);
            }

            if (!data.data) {
                throw new Error(data.error);
            }
            setTaskColumns(data.data);
        }
        catch (Error) {
            console.error(Error);
        }
    }

    async function handleMoveOfTask(fromColId : string, toColId : string, taskId : string, taskIndex : number) {
        try {

            const response = await fetch(`/api/projects/${id}/board/task/move`, {
                method: "POST",
                body: JSON.stringify({
                    taskId: taskId,
                    fromColId: fromColId,
                    toColId: toColId,
                    taskIndex: taskIndex
                })
            })
    
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }

            //const movedTask : Task = data.task;
            //movedTask.colIndex = taskIndex;
            //const toCol : BoardTasksColumn | undefined = tasksColumns.find((col) => col.id == toColId);
            //const fromCol : BoardTasksColumn | undefined = tasksColumns.find((col) => col.id == fromColId);
            await fetchColumns(id);
            // Moving task on client side for better optimalization now have bugs dont work
            /*
            if (toCol && fromCol) {
                let add : boolean = true;
                for (const task of toCol.tasks) {
                    if (task.id == movedTask.id) {
                        add = false;
                    }
                }
                if (add) {
                    toCol.tasks.push(movedTask);
                }
                // preskladaní tasků podle indexu v danem poly
                toCol.tasks.sort((task1, task2) => {
                    return sortTaskByColIndex(task1, task2); 
                })
                if (fromCol.id == toCol.id) {
                    return;
                }
                const newFromTasks : Task[] = [];
                for (const task of fromCol.tasks) {
                    if (task.id != movedTask.id) {
                        newFromTasks.push(task);
                    }
                }
                newFromTasks.sort((task1, task2) => {
                    return sortTaskByColIndex(task1, task2); 
                })
                fromCol.tasks = newFromTasks;
                const newBoardColumns : BoardTasksColumn[] = [];
                for (const col of tasksColumns) {
                    switch (col.id) {
                        case toCol.id: 
                            newBoardColumns.push(toCol); 
                            break;
                        case fromCol.id: 
                            newBoardColumns.push(fromCol);
                            break;
                        default: 
                            newBoardColumns.push(col);
                    }
                }
                setTaskColumns(newBoardColumns);
            }
            else {
                await fetchColumns(id);    
            }
            */

        } catch (error) {
            console.error(error)
        }
    }

    async function createColumn(name : string) {
        try {
            const res = await fetch(`/api/projects/${id}/board/column/create`, {
                method: "POST",
                body: JSON.stringify({
                    name: name
                })
            })

            if (!res.ok) {
                const data = await res.json();
                console.log(data.error);
                return; 
            }

            fetchColumns(id);
        }
        catch (error) {
            console.error(error);
        }
    }


    return (
        <TasksColumnsContext.Provider value={{ tasksColumns, setTaskColumns }}>
            <div className='relative'>
                <Head text='Board'/>
                <section className='flex gap-4 mb-4 w-fit h-fit items-end'>
                    <SearchInput/>
                    <FilterButton onClick={toggleFilterDialog}/>
                </section>
                { isFilterDialog && <FilterDialog handleClose={toggleFilterDialog}/>}
                <section className="flex gap-2 w-full">
                    {
                        tasksColumns.map((col, index) => (
                            <TasksColumn 
                                key={col.id} 
                                index={index} 
                                projectId={id}
                                handleMoveOfTask={handleMoveOfTask}
                            />
                            
                        ))
                    }
                    <Creator what={"Create new column"} handleCreate={createColumn}/>
                </section>

            </div>
        </TasksColumnsContext.Provider>
    )
}



function TasksColumn(
        { index, projectId, handleMoveOfTask } : 
        { index : number, projectId : string, handleMoveOfTask : (fromColId : string, toColId : string, taskId : string, taskIndex : number) => void }
    ) {
    const [ creating, toggle ] = useReducer((creating : boolean) => !creating, false);
    const { tasksColumns: tasksColumns } = useContext(TasksColumnsContext);
    const [ tasksCol , setTasksCol ] = useState<BoardTasksColumn>(tasksColumns[index]);
    const [ isDragetOver, setIsDragetOver ] = useState<boolean>(false);
    const tasksRef = useRef<HTMLUListElement>(null);

    function handleCreateTaskForm() {
        toggle();
    }

    useEffect(() => {
        setTasksCol(tasksColumns[index])
    }, [tasksColumns]);


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
            setTasksCol({ id: tasksCol.id, boardId: tasksCol.id, name: tasksCol.name, tasks: newTasks });
        }
        catch (error) {
            console.error(error);
        }
    }

    // TODO: api for delete and remove (remove delete from full project, removu only from board)
    async function deleteTask(id : string) {
        try {
            const response = await fetch(`/api/projects/${projectId}/board/task/delete`, {
                method: "POST",
                body: JSON.stringify({
                    taskId: id
                })
            });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json.error);
            }

            const newTasks : Task[] = json.tasks;
            setTasksCol({ id: tasksCol.id, boardId: tasksCol.id, name: tasksCol.name, tasks: newTasks });
        }
        catch (error) {
            console.error(error);
        }
    }

    async function updateTask(updateTask : Task) {
        try {
            const response = await fetch(`/api/projects/${projectId}/board/task/update`, {
                method: "POST", 
                body: JSON.stringify({
                    task: updateTask
                })
            });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json.error);
            }
            const tasks : Task[] = tasksCol.tasks;
            const updatedTasks : Task[] = [];
            for (let task of tasks) {
                updatedTasks.push(task.id == updateTask.id ? updateTask : task);
            }
            setTasksCol({ id: tasksCol.id, boardId: tasksCol.id, name: tasksCol.name, tasks: updatedTasks });
        } catch (error) {
            console.error(error);
        }
    }
    //TODO
    async function removeTask(id : string) {
        try {

        } catch (error) {

        }
    }

    async function handleOnDrop(e : React.DragEvent) {
        const fromColId : string = e.dataTransfer.getData("text/colId");
        const taskId : string = e.dataTransfer.getData("text/taskId");

        const mouseY : number = e.clientY;
        const tasksElements : NodeListOf<Element> | undefined = tasksRef.current?.querySelectorAll('[data-task-id]');
        if (!tasksElements) return;
        const tasksPositions : number[] = Array.from(tasksElements).map(taskElement => {
            const taskRect = taskElement.getBoundingClientRect();
            return taskRect.top + taskRect.height / 2;
        })
        let taskIndex : number = 0;
        while (taskIndex < tasksPositions.length && mouseY > tasksPositions[taskIndex]) taskIndex++;
        const colId = tasksColumns[index].id;    

        handleMoveOfTask(fromColId, colId, taskId, taskIndex);
        setIsDragetOver(false);
    }
    // TODO: animace pro tasky posunuti dolu
    function handleOnDrag(e : React.DragEvent, task : Task) {
        e.dataTransfer.setData("text/colId", tasksCol.id);
        e.dataTransfer.setData("text/taskId", task.id);
    }

    function handleDragOver(e : React.DragEvent) {
        e.preventDefault();
        if (!isDragetOver) {
            setIsDragetOver(true);
        }
    }

    function handleOnLeave(e : React.DragEvent) {
        setIsDragetOver(false);
    }

    return (
        <section 
            className={`rounded w-80 h-fit ${isDragetOver ? "bg-neutral-700" : "bg-neutral-950"}`} 
            onDrop={handleOnDrop} 
            onDragOver={handleDragOver} 
            onDragExit={handleOnLeave} 
            onDragLeave={handleOnLeave}
        >
            <div className="p-2 border-b border-neutral-400">
                <h2 className="">{tasksCol.name}</h2>
            </div>
            <div className="p-2">
                <ul className={`flex flex-col gap-2 mb-2`} ref={tasksRef}>
                    { 
                        tasksCol.tasks.map((task) => (
                            <TaskComponent 
                                key={task.id} 
                                projectId={projectId}
                                task={task} 
                                deleteTask={() => deleteTask(task.id)} 
                                removeTask={() => removeTask(task.id)} 
                                handleOnDrag={(e) => handleOnDrag(e, task)}
                                updateTask={updateTask}
                            />
                    ))
                    }
                    { creating && <CreatorOfTask key={"create"} createTask={createTask} endCreate={toggle}/> }
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

type Solver = {
    id: string,
    memberId: string,
    name: string,
    surname: string,
    image: string | null,
}



// TODO: to much argumentsa need to be better solved
function TaskComponent(
        { task, projectId, removeTask, deleteTask, handleOnDrag, updateTask } : 
        { projectId : string, task : Task, removeTask : () => void, deleteTask : () => void, handleOnDrag : (e : React.DragEvent) => void , updateTask : (task : Task) => void},) {
    const [ isMenu, toggleMenu ] = useReducer((isMenu) => !isMenu, false);
    const [ isInfo, toggleInfo ] = useReducer((isInfo) => !isInfo, false);
    const [ isSolversMenu, toggleSolversMenu ] = useReducer((isSolversMenu) => !isSolversMenu, false);
    const [ solvers, setSolvers ] = useState<Solver[]>([]);

    async function fetchSolvers() {
        try {
            const res = await fetch(`/api/projects/${projectId}/task/${task.id}/solver`, {
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
    //TODO : change api endpoint
    async function addSolver(memberId : string) {
        //task.projectMemberId =  memberId;
        try {
            const res = await fetch(`/api/projects/${projectId}/board/task/solver`, {
                method: "POST",
                body: JSON.stringify({
                    task: task,
                    memberId: memberId
                })
            })
            
            if (!res.ok) {
                const data = await res.json();
                console.error(data.error);
            }
            fetchSolvers();
        }
        catch (error) {
            console.error(error);
        }
        
    }
    //TODO: del api
    async function delSolver(memberId : string) {
        try {
            const res = await fetch(`/api/projects/${projectId}/board/task/remove`, {
                method: "POST",
                body: JSON.stringify({
                    task: task,
                    memberId: memberId
                })
            }) 
            if (!res.ok) {
                const data = await res.json();
                console.error(data.error);
            }
            fetchSolvers();
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchSolvers()
    }, []);

    function changeName(name : string) {
        task.name = name;
        updateTask(task);
    }


    const MoreMenuItems : MoreMenuItem[] = [
        { name: "Info", handler: toggleInfo },
        { name: "Remove", handler: removeTask },
        { name: "Delete", handler: deleteTask },
    ];
    
    return (
        <>
            <li className="rounded bg-neutral-900 p-2 flex flex-col gap-2 relative" draggable onDragStart={handleOnDrag} data-task-id={task.id}>
                <div className='flex w-full justify-between gap-1'>
                    <Name name={task.name} submitName={changeName}/>
                    <MoreButton handleClick={toggleMenu}/>
                    {
                        isMenu && <MoreMenu items={MoreMenuItems}/>
                    }
                </div>
                <div className={`flex justify-between ${task.priority ? "" : "flex-row-reverse"}`}>
                    { task.priority && <PriorityImg priority={task.priority}/> }
                    
                    <div className='relative flex gap-1'>
                        { task.teamId && <TeamInf teamId={task.teamId} projectId={projectId}/>}
                        <Solver handleSolversMenu={toggleSolversMenu} solvers={solvers}/>
                        {
                            isSolversMenu 
                                && 
                                <SolversMenu 
                                    projectId={projectId} 
                                    solvers={solvers} 
                                    addSolver={addSolver}
                                    delSolver={delSolver}
                                    />              
                        }
                    </div>
                </div>
            </li>
            {isInfo && <TaskInfo id={task.id} projectId={projectId} handleClose={toggleInfo} submitTask={updateTask}/>}
        </>
    )
}



function TeamInf({ teamId, projectId } :  { projectId : string, teamId : string }) {
    const [ team, setTeam ] = useState<Team | null>(null); 

    async function fetchTeam(teamId : string ) {
        try {
            const res = await fetch(`/api/pojects/${projectId}/team/${teamId}/info`, {
                method: "GET"
            })

            const data = await res.json(); 
            if (!res.ok) {
                console.error(data.error);
            }

            setTeam(data.team);
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => { 
        fetchTeam(teamId);
    }, []);

    if (!team) {
        return (
            <div className='text-sm'>Loading ...</div>
        )
    } 
    
    return (
        <div title={"Current Team"} className=' bg-violet-600 bg-opacity-60 border-violet-600 rounded text-sm flex justify-center'>
            {team.name}
        </div>
    )
}





// TODO: change to diferent icon or array of imiges undner
function Solver({ handleSolversMenu, solvers} : { handleSolversMenu : () => void, solvers : Solver[]}) {
    let img = "/avatar.svg";
    const solver : Solver | null = solvers[0];
    if (solver && solver.image) {
        img = pathToImages + "user/" + solvers[0].image;
    }
    
    return (
        <button className='w-fit h-fit rounded-full hover:bg-neutral-950 p-1' title={solver ? `${solver.name} ${solver.surname}` : "add solver"} onClick={handleSolversMenu}>
            <Image src={"/avatar.svg"} alt="avatar" width={2} height={2} className='w-6 h-6 rounded-full bg-neutral-300 cursor-pointer'></Image>
        </button>    
    )
}

type MemberTableInfo = {
    memberId: string,
    image: string | null,
    name: string,
    surname: string,
    seniority: string | null,
    position: string | null,
}


function SolversMenu({ projectId, solvers, addSolver, delSolver } : { projectId : string, solvers : Solver[], addSolver : (memberId : string) => void, delSolver : (solverId : string) => void }) {
    const [ users, setUsers ] = useState<MemberTableInfo[]>([]);
   
    useEffect(() => {
        fetchProjectUsers(projectId);
    }, []);

    // TODO: error hendeling
    async function fetchProjectUsers(projectId : string) {
        try {
            const response = await fetch(`/api/projects/${projectId}/members`, {
                method: "GET"
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error);
            }
            setUsers(data.data);
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='w-fit bg-neutral-950  absolute right-0 top-8 z-50 p-0 rounded shadow-neutral-900 shadow'>
            <input className='w-fit bg-neutral-900 rounded m-1 outline-none border-none py-1 px-2'></input>
            <ul>
            {users.map((user) => {
                const isSolver = solvers.some((solver) => solver.memberId === user.memberId);
                var imgSrc = "/avatar.svg"
                if (user.image) {
                    imgSrc = `/uploads/user/${user.image}`
                }
                return (
                    <li key={user.memberId} 
                        className={`flex gap-2 m-1 p-1 hover:bg-neutral-800 cursor-pointer rounded relative`} 
                        onClick={() => addSolver(user.memberId)}>
                        <Image src={imgSrc} alt="avatar" height={5} width={5} className='w-6 h-6 rounded-full'/>
                        <h5>{user.name} {user.surname}</h5>
                        {isSolver && <CurrentSolver delSolver={() => delSolver(user.memberId)}/>}
                    </li>
                    );
                })}
            </ul>
        </div>
    )
}

function CurrentSolver({ delSolver } : { delSolver : () => void}) {
    return (
        <div className=' border border-green-600 rounded-full  px-1 flex text-green-600 bg-green-600 bg-opacity-20'>
            <p className='text-sm'>current</p>
            <button onClick={delSolver}><img src="/x.svg" className='w-4 h-4'></img></button>
        </div>
        
    )
}



function AddTaskColumn() {
    return (
        <button className='w-fit h-fit'>
            <Image src="/plus.svg" alt="avatar" width={2} height={2} className='w-7 h-7 rounded bg-neutral-950 cursor-pointer'></Image>
        </button>
    )
}

function Name({ name, submitName } : { name : string, submitName : (name : string) => void }) {
    const [ edit, toggleEdit ] = useReducer(edit => !edit, false);
    
    function handleKeyDown(event :  KeyboardEvent<HTMLInputElement>) {
        const inputValue = event.currentTarget.value;
        if (event.key === 'Enter') {
            if (inputValue.length > 0) {
                submitName(inputValue);
                toggleEdit();
            }
        }
    }
    return (
        <div className='flex gap-2'>
            {
                edit ? 
                    <input defaultValue={name} type="text" className='w-fit bg-neutral-900 border-b outline-none' onKeyDown={handleKeyDown}></input>
                    :
                    <h3 className='w-fit'>{name}</h3>
            }
            <button onClick={toggleEdit} className='w-fit h-fit rounded hover:bg-neutral-950 p-1' title="edit name" style={ {backgroundColor: edit ? "#0a0a0a" : ""}}>
                <Image src="/pencil.svg" alt="more" width={2} height={2} className='w-5 h-5 rounded-full cursor-pointer'></Image>
            </button>
        </div>
    )
}

function MoreButton({ handleClick } : { handleClick : () => void}) {
    return (
        <button className='h-fit rounded hover:bg-neutral-950 p-1'>
            <Image src="/more.svg" alt="more" width={2} height={2} onClick={handleClick} className='w-5 h-5 rounded-full cursor-pointer'></Image>
        </button>
    )
}


function MoreMenu({ items } : { items : MoreMenuItem[] }) {
    return (
        <ul className='absolute w-28 bg-neutral-950 rounded p-2 right-0 top-10 z-50 shadow shadow-neutral-900'>
            {
                items.map((item) => (
                    <MoreMenuItems key={item.name} name={item.name} handleClick={item.handler}/>
                ))
            }
        </ul>
    )
}

function MoreMenuItems({ name, handleClick } : { name : string, handleClick : () => void }) {
    return (
        <li>
            <button className='link-secundary h-6' onClick={handleClick}>{name}</button>
        </li>
    )
}


// Not implemented
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
                        <li key={tag.id} className='p-1'>{tag.name}</li>
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

function sortTaskByColIndex(task1 : Task, task2 : Task) : number {
    if (!task1.colIndex && !task2.colIndex) return 0; // obě hodnoty jsou null, vrátíme nulu
    if (!task1.colIndex) return 1; // task1 má null colIndex, takže ho umístíme za task2  
    if (!task2.colIndex) return -1; // task2 má null colIndex, takže ho umístíme za task2
    return task2.colIndex - task1.colIndex;
}
