"use client"
import { useEffect, useReducer, useState, createContext, useContext, useRef} from 'react'
import { FilterButton, SearchInput } from "../components/filter-tables";
import { CreateTaskButton, Head } from "../components/other";
import { GroupOfTasks } from "@/app/api/projects/[id]/[board]/route";
import { Task, TaskColumn, TasksGroup } from "@prisma/client";
import { Solver } from "@/app/api/projects/[id]/task/[taskId]/[func]/route";
import Image from 'next/image' 
import { TaskInfo } from "../components/task-info";
import { PriorityText } from "./components/priority";
import { Creator, CreatorOfTask } from './components/creator';
import { ArrayButtons, Button, ButtonType, Lighteness } from '@/app/components/buttons';
import { unassigned } from '@/config';
import { BoardsTypes } from '@/app/api/projects/[id]/[board]/board';
import { Name } from '../components/other-client';

interface FunctionsContextType {
    createGroup: (name: string) => void;
    deleteGroup: (group: GroupOfTasks) => void;
    updateGroup: (groupID: string, propertyKey : keyof GroupOfTasks, val : number | string) => void;
    fetchGroups: () => void;
    openTaskInfo : (task : Task) => void;
    projectId: string;
    collumns: TaskColumn[];
    groups: GroupOfTasks[]
}

const FunctionsContext = createContext<FunctionsContextType | null>(null);

export default function Backlog({ id } : { id : string }) {
    const [ groups, setGroups] = useState<GroupOfTasks[]>([]); 
    const [ collumns, setColumns] = useState<TaskColumn[]>([]);
    const [ isInfo, toggleInfo ] = useReducer(isInfo => !isInfo, true);
    const [ task, setTask ] = useState<Task | null>(null);
    async function fetchGroups() {
        try {
            const res = await fetch(`/api/projects/${id}/${BoardsTypes.Backlog}`, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                console.error(data.error);
                return;
            }
            const newGroups : GroupOfTasks[] = data.backlog
            newGroups.sort((a, b) => sortGroups(a, b));
            setGroups(newGroups);
            setColumns(data.collumns);
        }
        catch (error) {
            console.error(error);
        }
    }


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
            }
        }
        catch (error) {
            console.error(error);
        }
    
    }

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
                console.error(data.error);
                return;
            }
            fetchGroups();
        }   
        catch (error) {
            console.error(error);
        }
    }

    function openTaskInfo(task : Task) {
        setTask(task);
        toggleInfo();
    }

    async function updateTask(updateTask : Task) {
        try {
            const response = await fetch(`/api/projects/${id}/${BoardsTypes.Backlog}/task/update`, {
                method: "POST", 
                body: JSON.stringify({
                    task: updateTask
                })
            });
            
            if (!response.ok) {
                const json = await response.json();
                throw new Error(json.error);
            }
            fetchGroups();
        } catch (error) {
            console.error(error);
        }
    }

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

            fetchGroups();
        }
        catch (error) {
            console.error(error);
        }
        return;
    }

    useEffect(() => {
        fetchGroups()
    }, []);

    return (
        <FunctionsContext.Provider value={{ createGroup, updateGroup, deleteGroup, fetchGroups, openTaskInfo, projectId: id, collumns: collumns, groups: groups }}>
            <div className="w-3/4 mx-auto relative">
                <Head text="Backlog"/>
                {/*<section className='flex gap-4 mb-4 w-fit h-fit items-end'>
                    <SearchInput/>
                    <FilterButton onClick={() => fetchGroups}/>
                </section>*/}
                <ListOfGroups groups={groups} />
                {isInfo && task && <TaskInfo id={task.id} projectId={task.projectId} handleClose={toggleInfo} submitTask={updateTask}/>}
            </div>
        </FunctionsContext.Provider>
    )
}

function ListOfGroups({ groups } : { groups : GroupOfTasks[]}) {
    //const [ draggetType, setDraggetType ] = useState<DraggTypes | null>(null);
    const { createGroup, fetchGroups, updateGroup, projectId } = useContext(FunctionsContext)!;
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
            console.error(data.error); 
        
        }
        catch (error) {
            console.error(error);
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


function GroupList({ group, moveTask, moveGroup } : { group : GroupOfTasks, moveTask : (groupId : string, taskId : string) => void, moveGroup : (groupId : string, pos : number ) => void}) {
    const [ displayd, setDisplayd ] = useState<string>("block"); 
    const [ isCreating, toggleCreating ] = useReducer(isCreating => !isCreating, false);
    const [ isDragOver, toggleDragOver ] = useReducer(isDragOver => !isDragOver, false);
    
    const { deleteGroup, updateGroup, fetchGroups, projectId, groups } = useContext(FunctionsContext)!;

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
            console.error(data.error);
        }
        catch (error) {
            console.error(error);
        }
    }


    function handleDropTask(e : React.DragEvent) {
        e.preventDefault();
        const type = e.dataTransfer.getData("text/type");
        if (type != "task") {
            return;
        }
        const taskId = e.dataTransfer.getData("text/taskId");
        const groupId = e.dataTransfer.getData("text/groupId");
        if (!taskId || !groupId) {
            return;
        }
        if (group.id != groupId) {
            moveTask(group.id, taskId);
        }
        toggleDragOver();
    }
    /*
    function handleOnDragGroup(e : DragEvent) {
        e.dataTransfer.setData("text/type", "group");
        e.dataTransfer.setData("text/groupId", group.id);
    }*/

    function handleOnDragTask(e : React.DragEvent, task : Task) {
        e.dataTransfer.setData("text/type", "task");
        e.dataTransfer.setData("text/taskId", task.id);
        e.dataTransfer.setData("text/groupId", group.id);
    }

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

    function updateName(name : string) {
        updateGroup(group.id, "name", name);
    }

    // zmanší zkupinu na uzivatelkse obrazovce (zakryje ukoly)
    function toSmallGroup() {
        setDisplayd(displayd == "block" ? "none" : "block");
    }
    
    const buttons : Button[] = new Array(4);
        
    buttons[2] = { onClick: toSmallGroup, img: "/dash-normal.svg", type: ButtonType.MidDestructive, size: 6, lightness: Lighteness.Bright, title: "Hide Tasks" }
    
    if (group.id != unassigned) {
        //buttons[0] = { onClick: () => openSettings(group), img: "/settings.svg", type: ButtonType.Normal, size: 2, padding: 1,lightness: Lighteness.bright, title: "Open Settings" };
        const pos : number = group.position ?? -2;
        if (pos > 0) {
            buttons[1] = { onClick: () => moveGroup(group.id, pos - 1), img: "/arrow-up.svg", type: ButtonType.Normal, size: 6, padding: 1, lightness: Lighteness.Bright, title: "Move Up" };
        }
        // - 2 - becouse of unassigned group
        if (pos < groups.length - 2) {
            buttons[0] = { onClick: () => moveGroup(group.id, pos + 1), img: "/arrow-down.svg", type: ButtonType.Normal, size: 6, padding: 1, lightness: Lighteness.Bright, title: "Move Down" };
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
            { displayd == "block" && <CreateTaskButton createTask={toggleCreating}/>}
        </li> 
    )
}



type ColumnInfo = {
    id: string,
    name: string
}

function GroupTask({ task, handleOnDrag } : {task : Task, handleOnDrag : (e : React.DragEvent) => void }) {
    //const [ isInfo, toggleInfo ] = useReducer(isInfo => !isInfo, false);
    const [ isSelecetCol, toggleSelectColl ] = useReducer(isSelecetCol => !isSelecetCol, false);
    const [ solvers, setSolvers ] = useState<Solver[]>([]);
    const [ colInfo, setColInfo ] = useState<ColumnInfo | null>(null);
    
    const { collumns, projectId, fetchGroups, openTaskInfo } = useContext(FunctionsContext)!;

    // ziska informace o řešičích daného ůkolu
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
        }
    }

    // vyhleda ve vsech sloupcích které jsou v projektu a ulozi ten ve kterem je dany ukol na tabuli board pokud neni v zadnem tak navrati
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
            console.error(data.error);
        }
        catch (error) {
            console.error(error);
        }
    }


    useEffect(() => {
        fetchSolvers();
    }, []);

    useEffect(() => {
        findColumnInfo();
    }, [task]);

     // TODO: Use button Array komponent insted of fix button html
    
    const buttons : Button[] = [
        { onClick: () => deleteTask(task), img: "/trash.svg", size: 8, padding: 2, type: ButtonType.Destructive, lightness: Lighteness.Dark, title: "Delete Task"},
        { onClick: () => removeTask(task), img: "/x.svg", size: 8, type: ButtonType.MidDestructive, lightness: Lighteness.Dark, title: "Remove Task"},
        { onClick: () => openTaskInfo(task), img: "/info-lg.svg", size: 8, padding: 2, type: ButtonType.Normal, lightness: Lighteness.Dark, title: "Task Info"},
    ]
    
   
    return (
        <>
            <li className="bg-neutral-100 w-full p-2 rounded grid  grid-cols-9 gap-2" draggable onDragStart={handleOnDrag}>
                <h3 className="col-span-3">{task.name}</h3>
                <div className='relative'>
                    <ColInfo info={colInfo} onClick={toggleSelectColl}/>
                    { isSelecetCol && <ColMenu info={colInfo} handleMoveCol={handleMoveCol} />}
                </div>
                <div className="col-span-2 flex items-center">{ task.priority && <PriorityText priority={task.priority}/>}</div>
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




function SolverComp({ solver } : { solver : Solver }) {
    const imgSrc = solver.image ? `/uploads/user/${solver.image}` : "/avatar.svg";
    return ( 
        <li key={solver.id}>
            <Image alt="Image" src={imgSrc} width={30} height={30} title={`${solver.name} ${solver.name}`} className="rounded-full bg-neutral-300"></Image>
        </li>
    )
}


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

// Array.sort(sort) - 
function sortGroups(a : GroupOfTasks, b : GroupOfTasks) : number {
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    
    return a.position - b.position;
}
