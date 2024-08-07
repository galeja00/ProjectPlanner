"use client"
import { useEffect, useReducer, useState, createContext, useContext, useRef} from 'react'
import { Head, TeamBadge } from "../components/other";
import { GroupOfTasks } from "@/app/api/projects/[id]/[board]/route";
import { Task, TaskColumn, TasksGroup, Team } from "@prisma/client";
import { Solver } from "@/app/api/projects/[id]/task/[taskId]/[func]/route";
import Image from 'next/image' 
import { TaskInfo } from "../components/task-info";
import { PriorityText } from "./components/priority";
import { Creator, CreatorOfTask } from './components/creator';
import { ArrayButtons, Button, ButtonSideText, ButtonType, ButtonWithImg, Lighteness } from '@/app/components/buttons';
import { unassigned } from '@/config';
import { BoardsTypes } from '@/app/api/projects/[id]/[board]/board';
import { Name } from '../components/other-client';
import { InitialLoader } from '@/app/components/other-client';
import { ErrorBoundary, ErrorState, useError } from '@/app/components/error-handler';
import { DeleteDialog } from '@/app/components/other';
import { Dialog, DialogClose } from '@/app/components/dialog';


// for Context to easy use of functions and values
interface FunctionsContextType {
    createGroup: (name: string) => void;
    deleteGroup: (group: GroupOfTasks) => void;
    updateGroup: (groupID: string, propertyKey : keyof GroupOfTasks, val : number | string) => void;
    fetchGroups: () => void;
    openTaskInfo : (task : Task) => void;
    submitError: (error : unknown, repeatFunc : () => void) => void
    projectId: string;
    collumns: TaskColumn[];
    groups: GroupOfTasks[]
}

const FunctionsContext = createContext<FunctionsContextType | null>(null);

// main compeent for rendering inside components
export default function Backlog({ id } : { id : string }) {
    const [ groups, setGroups] = useState<GroupOfTasks[]>([]); // state for every group display on backlog
    const [ collumns, setColumns] = useState<TaskColumn[]>([]); // all possible collumns for tasks
    const [ isInfo, toggleInfo ] = useReducer(isInfo => !isInfo, true);
    const [ isHowTo, toggleHowTo ] = useReducer(isHowTo => !isHowTo, false);
    const [ task, setTask ] = useState<Task | null>(null); // state inf isInfo = True will display atask info about task
    const [ initialLoading, setInitialLoading ] = useState<boolean>(false); 
    const { submitError } = useError(); // state if in fecth or other async comunication with server failed

    // init fetch of gorups
    async function fetchGroups(isInitialLoading : boolean) {
        if (isInitialLoading) {
            setInitialLoading(true);
        }
        try {
            const res = await fetch(`/api/projects/${id}/${BoardsTypes.Backlog}`, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message);
            }
            const newGroups : GroupOfTasks[] = data.backlog
            newGroups.sort((a, b) => sortGroups(a, b));
            setGroups(newGroups);
            setColumns(data.collumns);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => fetchGroups(isInitialLoading));
        }
        finally {
            setInitialLoading(false);
        }
    }

    // handle create of Group by submiting to RESP-API endpoint
    async function createGroup(name : string) {
        if (name.length == 0) {
            submitError("Your input for name of Group is empty", () => createGroup(name));
            return;
        }
        try {
            const res = await fetch(`/api/projects/${id}/${BoardsTypes.Backlog}/group/create`, {
                method: "POST",
                body: JSON.stringify({
                    name: name
                })
            }); 

            const data = await res.json();
            if (res.ok) {
                const newGroup : TasksGroup = data.group;
                const newGroups : GroupOfTasks[] = groups;
                newGroups.push({ id: newGroup.id, name: newGroup.name, backlogId: newGroup.backlogId, position: newGroup.position, tasks: []});
                newGroups.sort((a, b) => sortGroups(a, b));
                setGroups([...newGroups]);
                return;
            }
            throw new Error(data.message);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => createGroup(name));
        }
    }

    // handle delete of Group by fetching to REST-API endpoint
    async function deleteGroup(group : GroupOfTasks) {
        try {
            const res = await fetch(`/api/projects/${id}/${BoardsTypes.Backlog}/group/delete`, {
                method: "POST",
                body: JSON.stringify({
                    id: group.id
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message);
            }
            fetchGroups(false);
        }   
        catch (error) {
            console.error(error);
            submitError(error, () => deleteGroup(group));
        }
    }

    // handle of open a task info dialog with data of task
    function openTaskInfo(task : Task) {
        setTask(task);
        toggleInfo();
    }

    // handle update of Task by fatching to REAS-API enpoint
    async function updateTask(upTask : Task) : Promise<void> {
        try {
            const response = await fetch(`/api/projects/${id}/${BoardsTypes.Backlog}/task/update`, {
                method: "POST", 
                body: JSON.stringify({
                    task: upTask
                })
            });
            
            if (!response.ok) {
                const json = await response.json();
                throw new Error(json.error);
            }
            fetchGroups(false);
        } catch (error) {
            console.error(error);
            submitError( error, () => updateTask(upTask));
        }
    }

    // handle two types of update one postion in backlog and other change of property value
    async function updateGroup(groupId : string, propertyKey : keyof GroupOfTasks, val : string | number) {
        if (propertyKey != "position" && propertyKey != "name") {
            return;
        }
        try {
            const func = propertyKey == "position" ? "move" : "update";
            const res = await fetch(`/api/projects/${id}/${BoardsTypes.Backlog}/group/${func}`, {
                method: "POST",
                body: JSON.stringify({
                    id: groupId,
                    newVal: val,
                    key: propertyKey
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message);
            }

            fetchGroups(false);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => updateGroup(groupId, propertyKey, val));
        }
    }


    // initial fetch of basic needed data
    useEffect(() => {
        fetchGroups(true)
    }, []);

    if (initialLoading) {
        return (
            <InitialLoader/>
        )
    }
    const fetchGroupsProv = () => fetchGroups(false);
    return (
        <>
            <FunctionsContext.Provider value={{ createGroup, updateGroup, deleteGroup, fetchGroups: fetchGroupsProv , openTaskInfo, submitError, projectId: id, collumns: collumns, groups: groups }}>
                <div className="max-w-screen-lg w-full mx-auto">
                    <Head text="Backlog"/>
                    <div className='mb-2'>
                        <ButtonWithImg onClick={()=>toggleHowTo()} alt="Info" image="/info.svg" title="How to use Backlog"/>
                    </div>
                    <ListOfGroups groups={groups} />
                    {isInfo && task && <TaskInfo id={task.id} projectId={task.projectId} handleClose={toggleInfo} submitTask={updateTask}/>}
                    {isHowTo && <HowTo onClose={toggleHowTo}/>}
                </div>
            </FunctionsContext.Provider>
        </>
    )
}

// display 
function ListOfGroups({ groups } : { groups : GroupOfTasks[]}) {
    const { createGroup, fetchGroups, updateGroup, submitError, projectId } = useContext(FunctionsContext)!;
    const groupsRef = useRef<HTMLUListElement>(null);

    async function moveTask(groupId : string, taskId : string) {
        try {
            const res = await fetch(`/api/projects/${projectId}/${BoardsTypes.Backlog}/task/group-move`, {
                method: "POST",
                body: JSON.stringify({
                    groupId: groupId,
                    taskId: taskId
                })
            })

            if (res.ok) {
                fetchGroups(); 
                return;
            }
            const data = await res.json();
            throw new Error(data.message);
        
        }
        catch (error) {
            console.error(error);
            submitError(error, () => moveTask(groupId, taskId));
        }
    }

    function moveGroup(groupId : string, position: number) {
        if (position < 0 || position > groups.length - 1) {
            return;
        }
        updateGroup(groupId, "position", position);
    }

    return (
        <section className="w-full space-y-2" > 
            <Creator what="Create New Group" handleCreate={createGroup}/>
            <ul className="space-y-4 w-full" ref={groupsRef}>
                {
                    groups.map((group) => (
                        <GroupList key={group.id} group={group} moveTask={moveTask} moveGroup={moveGroup}/>
                    ))
                }
            </ul>
        </section>
        
    )
}

// componet render name of group and group tasks
function GroupList({ group, moveTask, moveGroup } : { group : GroupOfTasks, moveTask : (groupId : string, taskId : string) => void, moveGroup : (groupId : string, pos : number ) => void}) {
    const [ displayd, setDisplayd ] = useState<string>("block"); // to toggle diaplay mode of group tasks
    const [ isCreating, toggleCreating ] = useReducer(isCreating => !isCreating, false);
    const [ isDragOver, toggleDragOver ] = useReducer(isDragOver => !isDragOver, false);  
    const [ isDel, toggleDel ] = useReducer(isDel => !isDel, false);    
    
    const { deleteGroup, updateGroup, fetchGroups, submitError, projectId, groups } = useContext(FunctionsContext)!;

    // handle create of task by fecth to endpoint
    async function createTask(name : string) {
        if (name.length == 0) {
            submitError("Your input for name of Task is empty", () => createTask(name));
            return;
        }
        try {
            const res = await fetch(`/api/projects/${projectId}/${BoardsTypes.Backlog}/task/add`, {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    groupId: group.id
                })
            })
            if (res.ok) {
                toggleCreating();
                fetchGroups();
                return;
            }
            const data = await res.json();
            throw new Error(data.messgae); 
        }
        catch (error) {
            console.error(error);
            submitError(error, () => createTask(name)); 
        }
    }

    // handle drop of task when user wont to move it to other group
    function handleDropTask(e : React.DragEvent) {
        e.preventDefault();
        const type = e.dataTransfer.getData("text/type");
        // only allow to move with task
        if (type != "task") {
            return;
        }
        // get basic data from data tranfer to know with task from with group
        const taskId = e.dataTransfer.getData("text/taskId");
        const groupId = e.dataTransfer.getData("text/groupId");
        if (!taskId || !groupId) {
            return;
        }
        // call handler for move
        if (group.id != groupId) {
            moveTask(group.id, taskId);
        }
        toggleDragOver();
    }

    // initial handle for task drag event
    function handleOnDragTask(e : React.DragEvent, task : Task) {
        e.dataTransfer.setData("text/type", "task");
        e.dataTransfer.setData("text/taskId", task.id);
        e.dataTransfer.setData("text/groupId", group.id);
    }

    // chack if user is on group, if yes change visuals
    function handleDragOver(e : React.DragEvent) {
        e.preventDefault();
        const type = e.dataTransfer.getData("text/type");
        if (!isDragOver) {
            toggleDragOver();
        }
    }

    function handleOnLeave(e : React.DragEvent) {
        e.preventDefault();
        const type = e.dataTransfer.getData("text/type");
        if (isDragOver) {
            toggleDragOver();
        }
    }

    // handle update name
    function updateName(name : string) {
        updateGroup(group.id, "name", name);
    }

    // handle to smaller a group on user screen
    function toSmallGroup() {
        setDisplayd(displayd == "block" ? "none" : "block");
    }
    
    // create button array for basic funcs with group
    const buttons : Button[] = new Array(4); 
    buttons[2] = { onClick: toSmallGroup, img: "/dash-normal.svg", type: ButtonType.MidDestructive, size: 6, lightness: Lighteness.Bright, title: "Hide Tasks" }
    if (group.id != unassigned) {
        const pos : number = group.position ?? -2;
        if (pos > 0) {
            buttons[1] = { onClick: () => moveGroup(group.id, pos - 1), img: "/arrow-up.svg", type: ButtonType.Normal, size: 6, padding: 1, lightness: Lighteness.Bright, title: "Move Up" };
        }
        // - 2 - becouse of unassigned group
        if (pos < groups.length - 2) {
            buttons[0] = { onClick: () => moveGroup(group.id, pos + 1), img: "/arrow-down.svg", type: ButtonType.Normal, size: 6, padding: 1, lightness: Lighteness.Bright, title: "Move Down" };
        }
        buttons[3] = { onClick: () => toggleDel(), img: "/trash.svg", padding: 1, type: ButtonType.Destructive, size: 6, lightness: Lighteness.Bright, title: "Delete Group" };
    }
    

    return (
        <>
            <li key={group.id} 
            className={`w-full rounded p-2 space-y-2 ${isDragOver ? "bg-neutral-400" : "bg-neutral-200"}`}
            onDrop={handleDropTask}
            onDragOver={handleDragOver} 
            onDragExit={handleOnLeave} 
            onDragLeave={handleOnLeave}
            >
                <div className='flex justify-between'>
                    <Name name={group.name} updateName={updateName}></Name>
                    <ArrayButtons buttons={buttons} gap={1}/>
                </div>
                
                <ul className="space-y-2" style={{ display: displayd }}>
                    {
                        group.tasks.map((task) => (
                            <GroupTask key={task.id} task={task} handleOnDrag={(e) => handleOnDragTask(e, task)}/>
                        ))
                    }
                    { isCreating && <CreatorOfTask createTask={createTask} endCreate={toggleCreating} />}
                </ul>
                { displayd == "block" && <ButtonSideText text={"Create new Task"} image='/plus.svg' onClick={toggleCreating}/>}
            </li> 
            { isDel && <DeleteDialog message={`Do you really want to delete this Group?`} onClose={toggleDel} onConfirm={() => deleteGroup(group)}/>}
        </>
        
    )
}



type ColumnInfo = {
    id: string,
    name: string
}

// task component with is randred in group
function GroupTask({ task, handleOnDrag } : {task : Task, handleOnDrag : (e : React.DragEvent) => void }) {
    const [ isSelecetCol, toggleSelectColl ] = useReducer(isSelecetCol => !isSelecetCol, false); // to open pop up to change column on Board from Backlog
    const [ solvers, setSolvers ] = useState<Solver[]>([]);
    const [ team, setTeam ] = useState<Team | null>(null);
    const [ colInfo, setColInfo ] = useState<ColumnInfo | null>(null);
    const [ isDel, toggleDel ] = useReducer(isDel => !isDel, false);
    const { collumns, projectId, fetchGroups, openTaskInfo, submitError } = useContext(FunctionsContext)!;

    async function fetchSolversAndTeam() {
        try {
            const fetchPromises = [
                fetch(`/api/projects/${projectId}/task/${task.id}/solver`, {
                    method: "GET"
                })
            ];
    
            if (task.teamId !== null) {
                fetchPromises.push(
                    fetch(`/api/projects/${projectId}/team/${task.teamId}/info`, {
                        method: "GET"
                    })
                );
            }
            const [resSolvers, resTeam] = await Promise.all(fetchPromises);

            if (!resSolvers.ok || (task.teamId !== null && !resTeam.ok)) {
                throw new Error('Failed to fetch one or both endpoints');
            }

            const solversData = await resSolvers.json();

            if (!solversData.solvers) {
                throw new Error('No solvers data found');
            }

            if (task.teamId !== null) {
                const teamData = await resTeam.json();
                setTeam(teamData.team);
            }

            setSolvers(solversData.solvers);
        }
        catch (error) {
            console.error(error);
            submitError(error, fetchSolversAndTeam);
        }
    }
    
    async function removeTask(task : Task) {
        try {
            const res = await fetch(`/api/projects/${task.projectId}/${BoardsTypes.Backlog}/task/remove`, {
                method: "POST",
                body: JSON.stringify({
                    taskId: task.id
                })
            })

            if (!res.ok) {
                const data = await res.json(); 
                throw new Error(data.error);
            } 

            fetchGroups();
        }
        catch (error) {
            console.error(error);
            submitError(error, () => removeTask(task));
        }
    }
    
    async function deleteTask(task: Task) {
        try {
            const res = await fetch(`/api/projects/${task.projectId}/${BoardsTypes.Backlog}/task/delete`, {
                method: "POST",
                body: JSON.stringify({
                    taskId: task.id
                })
            })
            
            if (!res.ok) {
                const data = await res.json(); 
                throw new Error(data.message);
            } 

            fetchGroups();
        }
        catch (error) {
            console.error(error);
            submitError(error, () => deleteTask(task));
        }
    }


    // find in all columns of project and save in witch one is task saved
    function findColumnInfo() {
        if (task.taskColumnId == null) {
            return;
        }
        for (const col of collumns) {
            if (task.taskColumnId == col.id) {
                setColInfo({ id: col.id, name: col.name});
                return;
            }
        }
    }

    // handle move of task between columns
    async function handleMoveCol(id : string) {
        try {
            const res = await fetch(`/api/projects/${projectId}/${BoardsTypes.Backlog}/task/move`, {
                method: "POST",
                body: JSON.stringify({
                    taskId: task.id,
                    fromColId: task.taskColumnId,
                    toColId: id,
                    taskIndex: null
                })
            })
            
            if (res.ok) {
                fetchGroups();
                return;
            }
            const data = await res.json();
            throw new Error(data.message);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => handleMoveCol(id));
        }
    }


    useEffect(() => {
        fetchSolversAndTeam();
    }, []);

    useEffect(() => {
        findColumnInfo();
    }, [task]);

    
    const buttons : Button[] = new Array(3);
    buttons[0] = { onClick: () => toggleDel(), img: "/trash.svg", size: 8, padding: 2, type: ButtonType.Destructive, lightness: Lighteness.Dark, title: "Delete Task"}
    if (task.tasksGroupId) {
        buttons[1] = { onClick: () => removeTask(task), img: "/x.svg", size: 8, type: ButtonType.MidDestructive, lightness: Lighteness.Dark, title: "Remove Task"}
    }
    buttons[2] = { onClick: () => openTaskInfo(task), img: "/info-lg.svg", size: 8, padding: 2, type: ButtonType.Normal, lightness: Lighteness.Dark, title: "Task Info"}
   
    return (
        <>
            <li className="bg-neutral-100 w-full p-2 rounded grid  grid-cols-9 gap-2" draggable onDragStart={handleOnDrag}>
                <h3 className="col-span-3">{task.name}</h3>
                <div className='relative'>
                    <ColInfo info={colInfo} onClick={toggleSelectColl}/>
                    { isSelecetCol && <ColMenu info={colInfo} handleMoveCol={handleMoveCol} />}
                </div>
                <div className="col-span-1 flex items-center">{ task.priority && <PriorityText priority={task.priority}/>}</div>
                <div className='col-span-1 flex items-center '>{ team && <TeamBadge name={team.name} color={team.color}></TeamBadge>}</div>
                <ul className="flex gap-1 h-full items-center col-span-2">
                    {
                        solvers.map((solver) => (
                            <SolverComp key={solver.id} solver={solver}/>
                        ))
                    }
                </ul>
                <div className="flex h-full items-center justify-end gap-1 col-span-1">
                    <ArrayButtons buttons={buttons} gap={1}/>
                </div>
            </li>
            { isDel && <DeleteDialog message={`Do you really want to delete this Task?`} onClose={toggleDel} onConfirm={() => deleteTask(task)}/>}
        </>
    )
}

// display solvers of task
function SolverComp({ solver } : { solver : Solver }) {
    const imgSrc = solver.image ? `/uploads/user/${solver.image}` : "/avatar.svg";
    return ( 
        <li key={solver.id}>
            <Image alt="picture" src={imgSrc} width={30} height={30} title={`${solver.name} ${solver.name}`} className="rounded-full w-7 h-7 bg-neutral-300 object-cover"></Image>
        </li>
    )
}

// display column info about task 
function ColInfo({ info, onClick } : { info : ColumnInfo | null, onClick : () => void }) {
    let text = "undefined";
    if (info) {
        text = info.name;
    }
    let style = "";
    switch (text) {
        case "To Do":
            style = "text-red-600";
            break;
        case "In Work":
            style = "text-yellow-600";
            break;
        case "Done":
            style = "text-green-600";
    }
    return (
        <button className={`flex items-center gap-2 col-span-2 ${style} cursor-pointer`} onClick={onClick} title='Change column'>
            {text}
            <Image src={'/down-arrow.svg'} width={10} height={5} alt={"change"} className='bg-neutral-100 w-3 h-6'/>
        </button>
    )
}

// menu where user can change in with column is task
function ColMenu({ info, handleMoveCol } : { info : ColumnInfo | null, handleMoveCol : (id : string) => void }) {
    const { collumns } = useContext(FunctionsContext)!;
    let toSelect : TaskColumn[] = [];
    if (info) {
        for (const col of collumns) {
            if (col.id != info.id) {
                toSelect.push(col);
            }
        }
    } 
    else {
        toSelect = collumns;
    }
    
    return (
        <ul className='absolute z-10 bg-neutral-200 shadow-sm shadow-neutral-100 rounded space-y-2 p-2 left-0 border'>
            {
                toSelect.map((col) => {
                    return (
                        <li key={col.id} onClick={() => handleMoveCol(col.id)} className='w-fit hover:text-violet-600 cursor-pointer hover:border-b border-neutral-600 hover:border-violet-600'>
                            {col.name}
                        </li>
                    )
                })
            }
        </ul>
    )
}

function sortGroups(a : GroupOfTasks, b : GroupOfTasks) : number {
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    
    return a.position - b.position;
}

// komponent display how to use time table
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
                        <Image src="/how/backlog/groupsbl.png" layout="fill" objectFit="contain" alt="Current Day"/>
                    </dt>
                    <dd className="col-span-4">
                        <h3 className="font-bold">Groups</h3>
                        <p>
                            A group is a collection of tasks or a large task that can be divided into smaller tasks. A group can be created using the "Create new Group" button, and tasks can then be added to it using the "Create new Task" button.
                            There is also a group called "unassigned," which contains tasks that have not been assigned to any group.
                        </p>
                    </dd>
                    <dt className="col-span-1 h-28 relative">
                        <Image src="/how/backlog/groupfuncs.png" layout="fill" objectFit="contain" alt="Current Day"/>
                    </dt>
                    <dd className="col-span-4">
                        <h3 className="font-bold">Functions with Group</h3>
                        <p>
                            You can perform various functions with a group. 
                            These functions are available in the group’s button menu in the following order: move down (if possible), move up (if possible), shrink, delete, and create new tasks.
                            The only special group, "unassigned," cannot be moved or deleted.
                        </p>
                    </dd>
                    <dt className="col-span-1 h-28 relative">
                        <Image src="/how/backlog/tasks.png" layout="fill" objectFit="contain" alt="Groups"/>
                    </dt>
                    <dd className="col-span-4">
                        <h3 className="font-bold">Tasks</h3>
                        <p>
                            Tasks are smaller, indivisible parts of a group. Each task displays basic information in the following order: column on the board, priority, assigned team, and task assignee. The column on the board can be changed by clicking on the relevant field and selecting a new option.
                            Following the information, there are function buttons for the task. The functions are listed in the following order: delete the task, remove the task (move it to "unassigned"), and open task details.
                        </p>                
                    </dd>
                    <dt className="col-span-1 h-28 relative">
                        <Image src="/how/backlog/taskmove.png" layout="fill" objectFit="contain" alt="Groups" className=''/>
                    </dt>
                    <dd className="col-span-4">
                        <h3 className="font-bold">Task move</h3>
                        <p>
                        Tasks can be moved between groups using Drag & Drop. However, note that the order of tasks within a group is not preserved, so it does not matter where you drop the task within the selected group.
                        </p>                
                    </dd>
                </dl>
            </div>
        </Dialog>
    )
}
