'use client'
import { Task, Team } from '@prisma/client'
import Image from 'next/image' 
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useReducer, useState, KeyboardEvent, useRef } from 'react'
import { TaskInfo } from '../components/task-info'
import { Head, TeamBadge } from '../components/other'
import { PriorityImg } from './components/priority'
import { Creator, CreatorOfTask } from './components/creator'
import { BoardsTypes } from '@/app/api/projects/[id]/[board]/board'
import { InitialLoader } from '@/app/components/other-client'
import {  useError } from '@/app/components/error-handler'
import { ArrayButtons, Button, ButtonSideText, ButtonType, ButtonWithImg, Lighteness } from '@/app/components/buttons'
import { DeleteDialog } from '@/app/components/other'
import { Dialog, DialogClose } from '@/app/components/dialog'


// defalt type for Object for work with column and tasks
type BoardTasksColumn = {
    id : string,
    boardId: string,
    name : string,
    tasks : Task[]
}

// provider of columns for components in board
type ProviderColumns = {
    tasksColumns: BoardTasksColumn[];
    setTaskColumns: Dispatch<SetStateAction<BoardTasksColumn[]>>;
    submitError: (error : unknown, repeatFunc : () => void) => void;
}

const TasksColumnsContext = createContext<ProviderColumns>({
    tasksColumns: [],
    setTaskColumns: () => {},
    submitError: () => { },
  });

// root component of board
export default function Board({ id } : { id : string }) {
    const [ tasksColumns, setTaskColumns ] = useState<BoardTasksColumn[]>([]); // state of or columns on board
    const [initialLoading, setInitialLoading] = useState<boolean>(true); // initial loading state
    const [ isHowTo, toggleIsHowTo ] = useReducer(isHowTo => !isHowTo, false);
    const [ delCol, setDelCol ] = useState<string | null>(null); 
    const { submitError } = useError();

    // get data of all columns from REST-API endpoint
    async function fetchColumns(id : string, isInitialLoading : boolean) : Promise<void> {
        if (isInitialLoading) {
            setInitialLoading(true);
        }
        try {
            const response = await fetch(`/api/projects/${id}/board`, {
                method: "GET"
            })
            const data = await response.json();
            if (!response.ok) {
                console.error(data.error);
            }

            if (!data.data) {
                throw new Error(data.message);
            }
            setTaskColumns(data.data);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => fetchColumns(id, false))
        }
        finally {
            setInitialLoading(false);
        } 
    }

    // handler for move task from one column to other or in same column (work for both cases) by submiting data to REST-API endpoint
    // REST-API endoint - handle all logic of move
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
                throw new Error(data.message);
            }

            fetchColumns(id, false);
        } catch (error) {
            console.error(error)
            submitError(error, () => handleMoveOfTask(fromColId, toColId, taskId, taskIndex));
        }
    }

    // handle create of new column by submiting data to endpoint REST-API
    async function createColumn(name : string) {
        if (name.length == 0) {
            submitError("Your input for name of Column is empty", () => createColumn(name));
            return;
        }
        try {
            const res = await fetch(`/api/projects/${id}/board/column/create`, {
                method: "POST",
                body: JSON.stringify({
                    name: name
                })
            })

            if (!res.ok) {
                const data = await res.json();
                console.log(data.message);
                return; 
            }

            fetchColumns(id, false);
        }
        catch (error) {
            console.error(error);
            submitError( error, () => createColumn(name));
        }
    }

    async function deleteColumn(colId : string) {
        try {
            const res = await fetch(`/api/projects/${id}/board/column/delete`, {
                method: "POST",
                body: JSON.stringify({
                    id: colId
                })
            })

            if (!res.ok) {
                const data = await res.json();
                console.log(data.message);
                return; 
            }

            fetchColumns(id, false);
            setDelCol(null);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => deleteColumn(id));
        }
    }

    // initial fetch of data when component is loaded
    useEffect(() => {
        fetchColumns(id, false);
    }, [])


    if (initialLoading) {
        return (
            <InitialLoader/>
        )
    }


    return (
        <>
            <TasksColumnsContext.Provider value={{ tasksColumns, setTaskColumns, submitError }}>
                <div className='relative'>
                    <div className='flex gap-4'>
                        <Head text='Board'/>
                        <ButtonWithImg onClick={()=>toggleIsHowTo()} alt="Info" image="/info.svg" title="How to use Board"/>
                    </div>
                    <section className="flex gap-2 w-full">
                        {
                            tasksColumns.map((col, index) => (
                                <TasksColumn 
                                    key={col.id} 
                                    index={index} 
                                    projectId={id}
                                    handleMoveOfTask={handleMoveOfTask}
                                    handleDelete={() => setDelCol(col.id)}
                                />
                                
                            ))
                        }
                        <Creator what={"Create new Column"} handleCreate={createColumn} lightness={Lighteness.Dark} big/>
                    </section>
                    { delCol && <DeleteDialog message='Do you really want to delete this Column?' onClose={() => setDelCol(null)} onConfirm={() => deleteColumn(delCol)}/>}
                </div>
                { isHowTo && <HowTo onClose={toggleIsHowTo}/>}
            </TasksColumnsContext.Provider>
        </>
    )
}


// component for lofi
function TasksColumn(
        { index, projectId, handleMoveOfTask, handleDelete } : 
        { index : number, projectId : string, handleMoveOfTask : (fromColId : string, toColId : string, taskId : string, taskIndex : number) => void, handleDelete : () => void }
    ) {
    const [ creating, toggle ] = useReducer((creating : boolean) => !creating, false); //toggle between creating of task and normal
    const [ isSmall, toggleSmall ] = useReducer(isSmall => !isSmall, true);
    const { tasksColumns: tasksColumns, submitError } = useContext(TasksColumnsContext);
    const [ tasksCol , setTasksCol ] = useState<BoardTasksColumn>(tasksColumns[index]);
    const [ isDragetOver, setIsDragetOver ] = useState<boolean>(false); // state if user is drag over column when he wont to ove task
    const tasksRef = useRef<HTMLUListElement>(null);

    function handleCreateTaskForm() {
        toggle();
    }
    
    // update column every time when all columns changed
    useEffect(() => {
        setTasksCol(tasksColumns[index]);
    }, [tasksColumns]);

    
 
    // sumbit created task to REST-API endpoint
    async function createTask(name : string) {
        if (name.length == 0) {
            submitError("Your input for name of Task is empty", () => createTask(name));
            return;
        }
        try {
            const colId = tasksCol.id;
            const response = await fetch(`/api/projects/${projectId}/${BoardsTypes.Board}/task/add`, {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    colId: colId
                })
            });
            
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json.message);
            }
            
            const newTask : Task = json.task;
            const newTasks : Task[] = tasksCol.tasks;
            newTasks.push(newTask);
            setTasksCol({ id: tasksCol.id, boardId: tasksCol.id, name: tasksCol.name, tasks: newTasks });
            toggle();
        }
        catch (error) {
            console.error(error);
            submitError(error, () => createTask(name));
        }
    }


    // delete delete from full project, removu only from board
    async function deleteTask(id : string) {
        try {
            const response = await fetch(`/api/projects/${projectId}/${BoardsTypes.Board}/task/delete`, {
                method: "POST",
                body: JSON.stringify({
                    taskId: id
                })
            });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json.message);
            }

            const newTasks : Task[] = json.tasks;
            setTasksCol({ id: tasksCol.id, boardId: tasksCol.id, name: tasksCol.name, tasks: newTasks });
        }
        catch (error) {
            console.error(error);
            submitError(error, () => deleteTask(id));
        }
    }

    // remove task from collum but will remain in project
    async function removeTask(id : string) {
        try {
            const res = await fetch(`/api/projects/${projectId}/${BoardsTypes.Board}/task/remove`, {
                method: "POST",
                body: JSON.stringify({
                    taskId: id
                })
            });
            const data = await res.json(); 
            if (!res.ok) {
                throw new Error(data.message);
            }
            const newTasks : Task[] = data.tasks;            
            setTasksCol({ id: tasksCol.id, boardId: tasksCol.id, name: tasksCol.name, tasks: newTasks}); 
        } catch (error) {
            console.error(error);
            submitError(error, () => removeTask(id)); 
        }
    }

    // submit new valius in task to REST-API endpoint
    async function updateTask(upTask : Task) {
        if (upTask.name.length == 0) {
            submitError("Your name of Task is empty", () => updateTask(upTask));
        }
        try {
            const response = await fetch(`/api/projects/${projectId}/${BoardsTypes.Board}/task/update`, {
                method: "POST", 
                body: JSON.stringify({
                    task: upTask
                })
            });
            const json = await response.json();
            if (!response.ok) {
                throw new Error(json.message);
            }
            const tasks : Task[] = tasksCol.tasks;
            const updatedTasks : Task[] = [];
            for (let task of tasks) {
                updatedTasks.push(task.id == upTask.id ? upTask : task);
            }
            setTasksCol({ id: tasksCol.id, boardId: tasksCol.id, name: tasksCol.name, tasks: updatedTasks });
        } catch (error) {
            console.error(error);
            submitError(error, () => updateTask(upTask))
        }
    }

    // handler for drop of task
    async function handleOnDrop(e : React.DragEvent) {
        // get data where task was placed and with one was it
        const fromColId : string = e.dataTransfer.getData("text/colId");
        const taskId : string = e.dataTransfer.getData("text/taskId");

        // get where user droped task
        const mouseY : number = e.clientY;
        // get all tasks element in columns and theyer positions
        const tasksElements : NodeListOf<Element> | undefined = tasksRef.current?.querySelectorAll('[data-task-id]');
        if (!tasksElements) return;
        const tasksPositions : number[] = Array.from(tasksElements).map(taskElement => {
            const taskRect = taskElement.getBoundingClientRect();
            return taskRect.top + taskRect.height / 2;
        })
        let taskIndex : number = 0;
        // try to find new position for moved task
        while (taskIndex < tasksPositions.length && mouseY > tasksPositions[taskIndex]) taskIndex++;
        const colId = tasksColumns[index].id;  
        // call handle to move task on postion and column  
        handleMoveOfTask(fromColId, colId, taskId, taskIndex);
        setIsDragetOver(false);
    }

    // handle init of drag event 
    function handleOnDrag(e : React.DragEvent, task : Task) {
        e.dataTransfer.setData("text/colId", tasksCol.id);
        e.dataTransfer.setData("text/taskId", task.id);
    }

    // indication for user
    function handleDragOver(e : React.DragEvent) {
        e.preventDefault();
        if (!isDragetOver) {
            setIsDragetOver(true);
        }
    }

    function handleOnLeave(e : React.DragEvent) {
        setIsDragetOver(false);
    }


    const buttons : Button[] = [
        { onClick: toggleSmall, img: "/dash-normal.svg", type: ButtonType.MidDestructive, size: 6, lightness: Lighteness.Bright, title: "Hide Tasks" },
        { onClick: handleDelete, img: "/trash.svg", type: ButtonType.Destructive, size: 6, lightness: Lighteness.Bright, title: "DeleteColumns", padding: 1}
    ]
    
    const displayed = isSmall ? "block" : "none";
    const w = isSmall ? "20rem" : "fit-content" ; 

    return (
        <>
            <section 
                className={`rounded h-fit ${isDragetOver ? "bg-neutral-400"  : "bg-neutral-200"}`} 
                onDrop={handleOnDrop} 
                onDragOver={handleDragOver} 
                onDragExit={handleOnLeave} 
                onDragLeave={handleOnLeave}
                style={{ width: w }}
            >
                <div className={`p-2 ${isSmall && "border-b"} border-neutral-400 flex justify-between gap-2`}>
                    <h2 className="">{tasksCol.name}</h2>
                    <ArrayButtons buttons={buttons} gap={1}/>
                </div>
                <div className="p-2" style={{ display: displayed}} >
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
                    <ButtonSideText text={"Create new Task"} image='/plus.svg' onClick={() => handleCreateTaskForm()} lightness={Lighteness.Bright}/>
                </div>
            </section>
        </>
        
    )
}
// for menu on task to do diferenc funcs
type MoreMenuItem = {
    name: string,
    img: string,
    p: number,
    handler: () => void
}

// type for solver of Task to display in popup
type Solver = {
    id: string,
    memberId: string,
    name: string,
    surname: string,
    image: string | null,
}



// compenent displying task in column
function TaskComponent(
        { task, projectId, removeTask, deleteTask, handleOnDrag, updateTask } : 
        { projectId : string, task : Task, removeTask : () => void, deleteTask : () => void, handleOnDrag : (e : React.DragEvent) => void , updateTask : (task : Task) => void}) {
    // reducers for pop up menus and dialog for task-info (true = on, false = off)
    const [ isInfo, toggleInfo ] = useReducer((isInfo) => !isInfo, false);
    const [ isSolversMenu, toggleSolversMenu ] = useReducer((isSolversMenu) => !isSolversMenu, false);
    const [ isDel, toggleDel ] = useReducer(isDel => !isDel, false); 
    // state of solvers of task
    const [ solvers, setSolvers ] = useState<Solver[]>([]);

    // fetch endopint to know with members are solving this task
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
                throw new Error(data.message);
            }
            setSolvers(data.solvers);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => fetchSolvers());
        }
    }

    // initial fetch
    useEffect(() => {
        fetchSolvers()
    }, []);

    function changeName(name : string) {
        if (name == task.name) return;
        const newTask = task;
        newTask.name = name;
        updateTask(newTask);
    }


    const MoreMenuItems : MoreMenuItem[] = [
        { name: "Info", img: "/info.svg", p: 0, handler: toggleInfo },
        { name: "Remove", img: "/x.svg", p: 0, handler: removeTask },
        { name: "Delete", img: "/trash.svg", p: 1,handler: toggleDel },
    ];


    return (
        <>
            <li className="rounded bg-neutral-100 p-2 flex flex-col gap-2 relative" draggable onDragStart={handleOnDrag} data-task-id={task.id}>
                <div className='flex w-full justify-between gap-1'>
                    <Name name={task.name} submitName={changeName}/>
                    <MoreMenu items={MoreMenuItems}/>
                </div>
                <div className={`flex justify-between ${task.priority ? "" : "flex-row-reverse"}`}>
                    { task.priority && <PriorityImg priority={task.priority}/> }
                    
                    <div className='relative flex gap-1 justify-center items-center'>
                        { task.teamId && <TeamInf teamId={task.teamId} projectId={projectId}/> }
                        <Solver handleSolversMenu={toggleSolversMenu} solvers={solvers}/>
                        { isSolversMenu && <SolversMenu solvers={solvers} /> }
                    </div>
                </div>
            </li>
            {isInfo && <TaskInfo id={task.id} projectId={projectId} handleClose={toggleInfo} submitTask={updateTask}/>}
            {isDel && <DeleteDialog message={`Do you really want to delete this Task?`} onClose={toggleDel} onConfirm={deleteTask}/>}
        </>
    )
}


// display basic info about team
function TeamInf({ teamId, projectId } :  { projectId : string, teamId : string }) {
    const [ team, setTeam ] = useState<Team | null>(null); 
    

    // fetch team witch solving this task
    async function fetchTeam(teamId : string ) {
        try {
            const res = await fetch(`/api/projects/${projectId}/team/${teamId}/info`, {
                method: "GET"
            })

            const data = await res.json(); 
            if (!res.ok) {
                console.error(data.message);
            }

            setTeam(data.team);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => fetchTeam(teamId));
        }
    }
    // inital fetch
    useEffect(() => { 
        fetchTeam(teamId);
    }, [teamId]);

    if (!team) {
        return (
            <div className='text-sm'>Loading ...</div>
        )
    } 
    
    return (
        <div title={"Current Team"} className='bg-opacity-40 flex items-center  h-fit'>
            <TeamBadge name={team.name} color={team.color} />
        </div>
    )
}





// small icon of first solver in bottom right of task 
// to open list of solvers
function Solver({ handleSolversMenu, solvers} : { handleSolversMenu : () => void, solvers : Solver[]}) {
    let img = "/avatar.svg";
    const solver : Solver | null = solvers[0];
    if (solver && solver.image) {
        img = "/uploads/user/" + solvers[0].image;
    }
    
    return (
        <button className='w-fit h-fit rounded-full hover:bg-neutral-200 p-1' title={solver ? `${solver.name} ${solver.surname}` : "add solver"} onClick={handleSolversMenu}>
            <Image src={img} alt="picture" width={20} height={20} className='w-6 h-6 rounded-full bg-neutral-400 cursor-pointer object-cover'></Image>
        </button>    
    )
}

// menu of all solvers of task
function SolversMenu({ solvers} : { solvers : Solver[] }) {
    return (
        <div className='w-max bg-neutral-200 absolute right-0 top-8 z-50 rounded shadow-neutral-100 shadow'>
            <h4 className='text-sm text-neutral-600 p-2'>Solvers:</h4>
            <ul>
            {solvers.map((user) => {
                var imgSrc = "/avatar.svg"
                if (user.image) {
                    imgSrc = `/uploads/user/${user.image}`
                }
                return (
                    <li key={user.memberId} 
                        className={`flex gap-2 m-1 p-1 rounded relative`} >
                        <Image src={imgSrc} alt="picture" height={10} width={10} className='object-cover w-6 h-6 rounded-full '/>
                        <h5>{user.name} {user.surname}</h5>
                    </li>
                    );
                })}
            </ul>
        </div>
    )
}

//for name oof atask to easy change it 
function Name({ name, submitName } : { name : string, submitName : (name : string) => void }) {
    const [ edit, toggleEdit ] = useReducer(edit => !edit, false);
    
    // handle user inputs to input when user is changing name
    function handleKeyDown(event :  KeyboardEvent<HTMLInputElement>) {
        const inputValue = event.currentTarget.value;
        if (event.key === 'Enter') {
            if (inputValue.length > 0) {
                submitName(inputValue);
                toggleEdit();
            }
        }
        else if (event.key == 'Escape') {
            toggleEdit();
        }
    }
    return (
        <div className='flex gap-2 w-fit'>
            {
                edit ? 
                    <input defaultValue={name} type="text" className=' w-48 bg-neutral-100 border-b border-neutral-700 outline-none' onKeyDown={handleKeyDown}></input>
                    :
                    <h3 className='w-fit'>{name}</h3>
            }
            <button onClick={toggleEdit} className=' w-fit h-fit rounded hover:bg-neutral-200 p-1' title="edit name">
                <Image src="/pencil.svg" alt="more" width={2} height={2} className='w-5 h-5 rounded-full cursor-pointer'></Image>
            </button>
        </div>
    )
}



function MoreMenu({ items }: { items: MoreMenuItem[] }) {
    const [isMenu, setMenu] = useState<boolean>(false);
    const menuRef = useRef<HTMLUListElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
  
    const isClickedOutside = (event: MouseEvent) => {
        if (menuRef.current && buttonRef.current) {
            return !menuRef.current.contains(event.target as Node) && !buttonRef.current.contains(event.target as Node);
        }
        return false;
      };
    
      function handleClickOutside(event: MouseEvent) {
        event.stopPropagation();
        if (isClickedOutside(event)) {
            setMenu(false);
        }
      }
  
    function handleClickButton(event: React.MouseEvent) {
        event.stopPropagation();
        setMenu(isMenu => !isMenu); 
    }
  
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenu]);
  
    return (
        <>
            <button ref={buttonRef} onClick={handleClickButton} className='h-fit rounded hover:bg-neutral-200 p-1'>
                <Image src="/more.svg" alt="more" width={20} height={20} className='w-5 h-5 rounded-full cursor-pointer' />
            </button>
            {isMenu && (
                <ul ref={menuRef} className='absolute w-28 bg-neutral-200 rounded p-2 right-0 top-10 z-20 shadow shadow-neutral-100 space-y-1'>
                    {items.map((item) => (
                        <MoreMenuItem key={item.name} item={item} />
                    ))}
          </ul>
        )}
      </>
    );
}

function MoreMenuItem({ item } : { item : MoreMenuItem}) {
    return (
        <li className='flex gap-2'>
            <Image src={item.img} width={15} height={15} alt="" className={`w-6 p-${item.p}`}></Image>
            <button className='link-secundary h-6' onClick={item.handler}>{item.name}</button>
        </li>
    )
}

function HowTo({ onClose } : { onClose : () => void}) {
    return (
        <Dialog>
            <div className='bg-neutral-200 rounded w-fit h-fit overflow-hidden relative'>
                <div className="p-4">
                    <DialogClose handleClose={onClose}></DialogClose>
                    <Head text="How to use Backlog"></Head>
                </div>
                <dl className="grid grid-cols-5 p-4 gap-4 w-[80rem]">
                    <dt className="col-span-1 h-28 relative">
                        <Image src="/how/board/column.png" layout="fill" objectFit="contain" alt="Column"/>
                    </dt>
                    <dd className="col-span-4">
                        <h3 className="font-bold">Column</h3>
                        <p>
                        A column indicates the stage of the tasks it contains. 
                        By default, three basic columns are created: To Do, In Work, and Done. Additional columns can be added using the Create new Column button. 
                        Each column allows functions such as shrinking, deleting, and adding tasks using the Create new Task button.
                        </p>
                    </dd>
                    <dt className="col-span-1 h-28 relative">
                        <Image src="/how/board/task.png" layout="fill" objectFit="contain" alt="Task"/>
                    </dt>
                    <dd className="col-span-4">
                        <h3 className="font-bold">Task</h3>
                        <p>
                            Task is an element of each column. It contains basic information about the task. This information includes the task name, 
                            which can be edited, and the priority, if specified, displayed at the bottom left. 
                            The assignee section shows the team assigned to the task and an image of one of the assignees. 
                            To learn more about the assignees, simply click on the assignees image. 
                        </p>
                    </dd>
                    <dt className="col-span-1 h-28 relative">
                        <Image src="/how/board/moremenu.png" layout="fill" objectFit="contain" alt="Task more menu"/>
                    </dt>
                    <dd className="col-span-4">
                        <h3 className="font-bold">Task more menu</h3>
                        <p>
                            You can open a popup menu with additional options for managing a task using the button in the top right corner of the task. 
                            The menu contains functions such as remove which removes the task from the board but keeps it in the project, 
                            delete which completely deletes the task, and info which opens a dialog with detailed information about the task.
                        </p>
                    </dd>
                    <dt className="col-span-1 h-28 relative">
                        <Image src="/how/board/taskmoveb.png" layout="fill" objectFit="contain" alt="Task move"/>
                    </dt>
                    <dd className="col-span-4">
                        <h3 className="font-bold">Task move</h3>
                        <p>
                            Tasks can be moved between columns using Drag & Drop. 
                            When moving a task, it is important to pay attention to the position where the task is dropped, 
                            as it determines the order of the tasks in that column. Tasks can also be rearranged within the same column to change their position.
                        </p>                
                    </dd>
                </dl>
            </div>
        </Dialog>
    )
}


/*
// Not implemented (future possible feature, not much importent)
function TagList() {
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
*/
function sortTaskByColIndex(task1 : Task, task2 : Task) : number {
    if (!task1.colIndex && !task2.colIndex) return 0; // obě hodnoty jsou null, vrátíme nulu
    if (!task1.colIndex) return 1; // task1 má null colIndex, takže ho umístíme za task2  
    if (!task2.colIndex) return -1; // task2 má null colIndex, takže ho umístíme za task2
    return task2.colIndex - task1.colIndex;
}


function submitError(error: unknown, arg1: () => Promise<void>) {
    throw new Error('Function not implemented.')
}

