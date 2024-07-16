"use client"
import { useEffect, useReducer, useState, createContext, useContext, useRef} from 'react'
import { ButtonSideText, Head, TeamBadge } from "../components/other";
import { GroupOfTasks } from "@/app/api/projects/[id]/[board]/route";
import { Task, TaskColumn, TasksGroup, Team } from "@prisma/client";
import { Solver } from "@/app/api/projects/[id]/task/[taskId]/[func]/route";
import Image from 'next/image' 
import { TaskInfo } from "../components/task-info";
import { PriorityText } from "./components/priority";
import { Creator, CreatorOfTask } from './components/creator';
import { ArrayButtons, Button, ButtonType, Lighteness } from '@/app/components/buttons';
import { unassigned } from '@/config';
import { BoardsTypes } from '@/app/api/projects/[id]/[board]/board';
import { Name } from '../components/other-client';
import { InitialLoader } from '@/app/components/other-client';
import { ErrorBoundary, ErrorState } from '@/app/components/error-handler';


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
    const [ task, setTask ] = useState<Task | null>(null); // state inf isInfo = True will display atask info about task
    const [ initialLoading, setInitialLoading ] = useState<boolean>(false); 
    const [ error, setError ] = useState<ErrorState | null>(null); // state if in fecth or other async comunication with server failed

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
                throw new Error(data.error);
                return;
            }
            const newGroups : GroupOfTasks[] = data.backlog
            newGroups.sort((a, b) => sortGroups(a, b));
            setGroups(newGroups);
            setColumns(data.collumns);
        }
        catch (error) {
            console.error(error);
            setError({ error: error, repeatFunc: () => fetchGroups(isInitialLoading) });
        }
        finally {
            setInitialLoading(false);
        }
    }

    // handle create of Group by submiting to RESP-API endpoint
    async function createGroup(name : string) {
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
            throw new Error(data.error);
        }
        catch (error) {
            console.error(error);
            setError({ error, repeatFunc: () => createGroup(name)})
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
                throw new Error(data.error);
            }
            fetchGroups(false);
        }   
        catch (error) {
            console.error(error);
            setError({ error, repeatFunc: () => deleteGroup(group)});
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
            setError({ error, repeatFunc: () => updateTask(upTask)});
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
                throw new Error(data.error);
            }

            fetchGroups(false);
        }
        catch (error) {
            console.error(error);
            setError({ error, repeatFunc: () => updateGroup(groupId, propertyKey, val)});
        }
    }

    function submitError(error : unknown, repeatFunc: () => void) {
        setError({error, repeatFunc});
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
        <ErrorBoundary error={error}>
            <FunctionsContext.Provider value={{ createGroup, updateGroup, deleteGroup, fetchGroups: fetchGroupsProv , openTaskInfo, submitError, projectId: id, collumns: collumns, groups: groups }}>
                <div className="w-3/4 mx-auto relative">
                    <Head text="Backlog"/>
                    <ListOfGroups groups={groups} />
                    {isInfo && task && <TaskInfo id={task.id} projectId={task.projectId} handleClose={toggleInfo} submitTask={updateTask}/>}
                </div>
            </FunctionsContext.Provider>
        </ErrorBoundary>
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
            }
            const data = await res.json();
            throw new Error(data.error);
        
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
    
    const { deleteGroup, updateGroup, fetchGroups, submitError, projectId, groups } = useContext(FunctionsContext)!;

    // handle create of task by fecth to endpoint
    async function createTask(name : string) {
        try {
            const res = await fetch(`/api/projects/${projectId}/${BoardsTypes.Backlog}/task/add`, {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    groupId: group.id
                })
            })
            if (res.ok) {
                fetchGroups();
                return;
            }
            const data = await res.json();
            throw new Error(data.error); 
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
            buttons[0] = { onClick: () => moveGroup(group.id, pos + 1), img: "/arrow-down.svg", type: ButtonType.MidDestructive, size: 6, padding: 1, lightness: Lighteness.Bright, title: "Move Down" };
        }
        buttons[3] = { onClick: () => deleteGroup(group), img: "/x.svg", type: ButtonType.Destructive, size: 6, lightness: Lighteness.Bright, title: "Delete Group" };
    }
    

    return (
        <li key={group.id} 
            className={`w-full rounded p-2 space-y-2 relative ${isDragOver ? "bg-neutral-400" : "bg-neutral-200"}`}
            onDrop={handleDropTask}
            onDragOver={handleDragOver} 
            onDragExit={handleOnLeave} 
            onDragLeave={handleOnLeave}
        >
            <Name name={group.name} updateName={updateName}></Name>
            <div className='absolute right-2 top-0 '>
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
                throw new Error(data.error);
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
            throw new Error(data.error);
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
    buttons[0] = { onClick: () => deleteTask(task), img: "/trash.svg", size: 8, padding: 2, type: ButtonType.Destructive, lightness: Lighteness.Dark, title: "Delete Task"}
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
            
        </>
    )
}

// display solvers of task
function SolverComp({ solver } : { solver : Solver }) {
    const imgSrc = solver.image ? `/uploads/user/${solver.image}` : "/avatar.svg";
    return ( 
        <li key={solver.id}>
            <Image alt="Image" src={imgSrc} width={30} height={30} title={`${solver.name} ${solver.name}`} className="rounded-full bg-neutral-300"></Image>
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
        <button className={`flex items-center col-span-2 ${style} cursor-pointer`} onClick={onClick}>{text}</button>
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
        <ul className='absolute z-10 bg-neutral-200 shadow-sm shadow-neutral-200 rounded space-y-2 p-2 left-0'>
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
