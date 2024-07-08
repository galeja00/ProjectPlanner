"use client"

import { useEffect, useReducer, useState, KeyboardEvent, ChangeEvent } from "react";
import Image from 'next/image' 
import { Issue, Tag, Task, Ranking, Team, ProjectMember } from "@prisma/client";
import { Dialog, DialogClose } from "@/app/components/dialog";
import { Solver } from "@/app/api/projects/[id]/task/[taskId]/[func]/route";
import { Name } from "./other-client";
import { TagList } from "./tags";


// TODO: Error handeling + loading screen
// dialog about displaying all info abou task
export function TaskInfo({ id, projectId, handleClose, submitTask } : { id : string, projectId : string, handleClose : () => void, submitTask : (task : Task) => void}) {
    const [task, setTask] = useState<Task | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [error, setError] = useState<boolean>(false);
    async function fetchInfo() {
        try {
            const res = await fetch(`/api/projects/${projectId}/task/${id}/info`, {
                method: "GET"
            })

            const data = await res.json();
            if(!res.ok) {
                throw new Error(data.error);
            }
            setTask(data.taskInfo.task);
            setTags(data.taskInfo.tags);
        }
        catch (error) {
            console.error(error);
            setError(true);
        }
    }

    function updateAndClose(task : Task) {
        submitTask(task);
        handleClose();
    }

    function updateTask(task : Task) {
        setTask(task);
        //console.log(task);
        submitTask(task);
    }
 
    useEffect(() => {
        fetchInfo();
    }, []);

    return (
        <Dialog>
            <div className='bg-neutral-200 rounded w-[80rem] h-fit overflow-hidden relative'>
                { task 
                    ?
                    <>
                        <HeaderContainer task={task} tags={tags} projectId={projectId} handleClose={() => updateAndClose(task)} updateTask={updateTask}/>
                        <div className='grid grid-cols-3 h-full'>
                            <MainInfoContainer task={task} updateTask={updateTask}/>
                            <section className='py-2 px-4  flex flex-col gap-4'>
                                <Data task={task} updateTask={updateTask}/>
                                <Solvers task={task} projectId={projectId}/>
                            </section>
                        </div>
                    </>
                    :
                    <>
                        <h3 className="h-60">Loading...</h3>
                        <DialogClose handleClose={handleClose}/>
                    </>
                }
            </div>
        </Dialog>
    ) 
}  

// HEADER PART //
function HeaderContainer(
    {task, tags, projectId, handleClose, updateTask } : 
    {task : Task, projectId : string,  tags : Tag[], handleClose : () => void, updateTask : (task : Task) => void}) { 
    function updateName(name : string) {
        task.name = name;
        updateTask(task);
    }

    return (
        <section className='px-6 py-4 border-b border-neutral-400 relative '>
            <Name name={task.name} updateName={updateName}/>
            <TagList tags={tags} projectId={projectId}/>
            <DialogClose handleClose={handleClose}/>
        </section>
    )
}

// MAIN INFRMATIONS

enum TypeOfInfo {
    description = "Description",
    issues = "Issues",
    nodes = "Nodes",
    settings = "Settings"
}

function MainInfoContainer({ task, updateTask } : { task : Task, updateTask : (task : Task) => void }) {
    const menuItems : TypeOfInfo[] = [TypeOfInfo.description, TypeOfInfo.issues, TypeOfInfo.nodes, TypeOfInfo.settings];
    const [actualTypeInfo, setActualInfoType] = useState<TypeOfInfo>(TypeOfInfo.description);
    const [actualInfo, setActualInfo] = useState<JSX.Element>(<Description task={task} updateTask={updateTask}/>);

    function handleChangeType(type : TypeOfInfo) {
        switch (type) {
            case TypeOfInfo.issues:
                setActualInfo(<Issues issues={[]}/>);
                setActualInfoType(TypeOfInfo.issues);
                break;
            case TypeOfInfo.nodes:
                setActualInfo(<Nodes/>);
                setActualInfoType(TypeOfInfo.nodes);
                break;
            case TypeOfInfo.settings: 
                setActualInfo(<Settings task={task}/>)
                setActualInfoType(TypeOfInfo.settings);
                break;
            default:
                setActualInfo(<Description task={task} updateTask={updateTask}/>);
                setActualInfoType(TypeOfInfo.description);
        }
    }


    return (
        <section className='col-span-2 border-r border-neutral-400 h-[28rem]'>
            <menu className='flex w-full border-b border-neutral-400'>
                {
                    menuItems.map((type) => (
                        <MenuItem key={type} name={type} actualType={actualTypeInfo} onClick={() => handleChangeType(type)}></MenuItem>
                    ))
                }
            </menu>
            {actualInfo}
        </section>
    )
}

function MenuItem({ name, actualType, onClick } : { name : string, actualType : TypeOfInfo, onClick : () => void}) {
    var bg : string = "bg-neutral-200";
    if (actualType == name) {
        bg = "bg-neutral-100";
    }
    return (
        <li className={`relative  ${bg}`}>
            <button onClick={onClick} className="hover:text-purple-600 px-4 py-2" >{name}</button>
        </li>
    )
}

function Description({ task, updateTask } : { task : Task, updateTask : (task : Task) => void }) {
    var desc = "Create a description for better understending of the task";
    if (task.description) {
        desc = task.description; 
    } 
    const [ isEditing, toggleEdit ] = useReducer(isEditing => !isEditing, false);
    const [ editDesc, setEditDesc ] = useState<string>(desc);
    /*function handleDesc(event : KeyboardEvent<HTMLTextAreaElement>) {
        const inputValue = event.currentTarget.value;
        if (event.key == 'Enter') {
            if (inputValue.length > 0) {
                task.description = inputValue;
                updateTask(task);
                toggleEdit();
            }
        }
    }*/
    
    function handleSubmit() {
        if (editDesc != "") {
            task.description = editDesc;
            updateTask(task);
            toggleEdit();
        } 
    }

    function handleChange(event : ChangeEvent<HTMLTextAreaElement>) {
        setEditDesc(event.target.value);
    }
    
    desc = editDesc;
    return (
        <article className='m-4 space-y-4'>
            <button onClick={toggleEdit} className={`w-fit h-fit flex gap-2 items-center hover:text-neutral-950 text-neutral-600 `}>
                <img src="/pencil.svg" alt="Edit Description" className={`rounded w-7 h-7 ${isEditing ? "bg-violet-600" : "bg-neutral-100"} p-1`}/>
                <div>Edit Description</div>
            </button>
            {
                isEditing ? 
                    <div className="space-y-2">
                        <textarea defaultValue={desc} onChange={handleChange} className="bg-neutral-100 w-full h-64 outline-none rounded focus:ring-1 focus:ring-violet-500 px-3 py-1"/>
                        <div className="flex flex-row-reverse">   
                            <button className="btn-primary relative right-0 bottom-0" onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                    :
                    <div>
                        <p className='px-3 py-1 bg-neutral-100 rounded '>
                            {desc}
                        </p>   
                    </div>

            }
        </article>
    )
}

function Issues({ issues } : { issues : Issue[] }) {
    const [isCreating, toggleCreating] = useReducer(isCreating => !isCreating, false); 
    return (
        <div>
            <div className="flex flex-row gap-4">
                <button className="bg-neutral-100 rounded" onClick={toggleCreating}>
                    <img src="plus.svg" alt="create"/>
                </button>
                <div>Create new Issue</div>
            </div>
            <ul>
                {
                    issues.map(issue => (
                        <IsssuesItem key={issue.id} issue={issue}/>
                    ))
                }
            </ul>
        </div>
    )
}

function IsssuesItem({ issue } : { issue : Issue }) {
    return ( 
        <li key={issue.id}>
            {issue.name}
        </li>
    )
}

function Nodes() {
    return (
        <>
        </>
    )
}

function Settings({ task } : { task : Task }) {
    const [ allTeams, setAllTeams ] = useState<Team[]>([]);
    const [ allMembers, setAllMembers ] = useState<ProjectMember[]>([]);

    async function fetchTeams() {
        try {
            const res = await fetch(`/api/projects/${task.projectId}/team`, {
                method: "GET"
            })

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            setAllTeams(data.teams);
        }
        catch (error) {
            console.error(error);
        }
    }

    async function fetchMembers() {
        try {
            const res = await fetch(`/api/projects/${task.projectId}/members`, {
                method: "GET"
            })

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            setAllTeams(data.data);
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchTeams();
        fetchMembers(); 
    }, []);

    return (
        <div className="flex gap-2 p-4">
            <div>
                <h4>Team</h4>
                <ul className="">
                    {
                        allTeams.map((team) => (
                            <li></li>
                        ))
                    }
                </ul>
            </div>
            <div>
                <h4>Solvers</h4>
                <ul className="">
                    {
                        allMembers.map((member) => (
                            <li></li>
                        ))
                    }
                </ul>
            </div>
        </div>
    )
}

// DATA INFORMATIONS

enum Colors {
    Green = "green",
    Yellow = "yellow",
    Red = "red",
}

type SelectType = {
    name : string
}


function Data({ task, updateTask } : { task : Task, updateTask : (task : Task) => void }) {
    const [isEditing, toggleEditing] = useReducer(isEditing => !isEditing, false);
    const [editedTask, setEditedTask] = useState<Task>(task);

    function changeMode() {
        
        if (isEditing) {
            console.log(editedTask);
            updateTask(editedTask);
        }
        toggleEditing();
    }

    function updateVal(name : string, newVal : any) {
        if (name == "estimatedHours" && typeof newVal == "string") {
            newVal = parseInt(newVal);
        }
        setEditedTask(editedTask => ({ ...editedTask, [name]: newVal }));
    }

    return (
        <div>
            <div className="flex gap-4">
                <h3 className='font-bold mb-2'>Info</h3>
                <button onClick={changeMode} className="h-fit" title="Edit Info"><img src="/pencil.svg" alt="Edit Info" className="w-5 h-5"/></button>
            </div>
            <ul className='bg-neutral-100 p-2 rounded w-full flex flex-col gap-2'>
                <DataItem name="type" value={task.type} isEditing={isEditing} updateVal={(newVal : any) => updateVal("type", newVal)}></DataItem>
                <DataItem name="priority" value={task.priority} isEditing={isEditing} updateVal={(newVal : any) => updateVal("priority", newVal)}></DataItem>
                <DataItem name="complexity" value={task.complexity} isEditing={isEditing} updateVal={(newVal : any) => updateVal("complexity", newVal)}></DataItem>
                <DataItem name="estimated hours" value={task.estimatedHours} isEditing={isEditing}  updateVal={(newVal : any) => updateVal("estimatedHours", newVal)}></DataItem>
            </ul>
        </div>
    )
}




function DataItem({name, value, isEditing, updateVal } : { name: string, value : any, isEditing : boolean, updateVal : (newVal : any) => void}) {
    var displaydVal : any = "undefined";
    if (value) {
        displaydVal = value;
    } 
    var textColor = "";
    var editElement : JSX.Element = <DataEditInput name={name} value={value} changeVal={(newValue : any) => updateVal(newValue)}/>;
    if (name == "complexity" || name == "priority") {
        switch (value) {
            case Ranking.high:
                textColor = Colors.Red;
                break;
            case Ranking.medium:
                textColor = Colors.Yellow;
                break;
            case Ranking.low:
                textColor = Colors.Green;
                break;
        }

        const select : SelectType[] = [
            { name: Ranking.high },
            { name: Ranking.medium },
            { name: Ranking.low }
        ]
        editElement = <SelectButtons items={select} value={value} changeVal={(newValue : string) => updateVal(newValue)}/>;
    }  
    return (
        <li className='grid grid-cols-2 gap-2'>
            <span>{name}:</span>
            {
                isEditing ?
                    <>{editElement}</>
                    :
                    <span style={{ color:textColor }}>{displaydVal}</span>
            }
        </li>
    )
}

function SelectButtons({ items, value, changeVal } : { items : SelectType[], value : string | null, changeVal : (newValue : string) => void}) {
    const [ selected, setSelected ] = useState<string | null>(value); 
    function select(value : string) {
        setSelected(value);
        changeVal(value);
    }

    return (
        <ul className="flex gap-1"> 
            {
                items.map(item => (
                    <li key={item.name} id={item.name}>
                        <button 
                            className={`btn btn-primary ${selected  == item.name ? "bg-violet-600 text-neutral-950" : ""} text-xs px-1 py-0.5`} 
                            onClick={() => select(item.name)}
                        >
                            {item.name}
                        </button>
                    </li>
                ))
            }
        </ul>
    )
}

function DataEditInput({ value, name, changeVal } : { value : string, name : string, changeVal : (newVal : any) => void }) {
    const type = name === "estimated hours" ? "number" : "text";
    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        changeVal(event.target.value);
    }
    return (
        <input type={type} defaultValue={value} min={"0"} className="bg-neutral-100 outline-none border-b" onChange={handleChange}></input>
    )
}


//TODO : solover fecth and change it
function Solvers({ task, projectId } : { task : Task, projectId : string }) {
    const [ solvers, setSolvers] = useState<Solver[]>([]); 
    const [ team, setTeam ] = useState<Team | null>(null); 
    //<button className='btn-primary absolute px-3 py-1 right-0 mr-2'>Change</button>
    async function fetchSolvers() {
        try {
            const res = await fetch(`/api/projects/${projectId}/task/${task.id}/solver`, {
                method: "GET",
            }); 
            const data = await res.json();
            if (!res.ok) {
                console.error(data.error);
                return;
            }

            setSolvers(data.solvers);
        }
        catch (error) {
            console.error(error);
        }
    }

    async function fetchTeam() {
        if (!task.teamId) {
            return;
        } 
        try {
            const res = await fetch(`/api/pojects/${projectId}/team/${task.teamId}/info`, {
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
        fetchSolvers();
        fetchTeam();
    }, []);

    //<button onClick={fetchSolvers} className="h-fit" title="Edit solvers"><img src="/pencil.svg" alt="Edit Info" className="w-5 h-5"/></button>
    return (
        <div className="space-y-2">
            <div>
                <div className="flex gap-2">
                    <h3 className='font-bold mb-2'>Solvers</h3>
                </div>
                <div>
                    <dt>team:</dt><dd>{team?.name}</dd>
                </div>
            </div>
            <ul className="space-y-2">
                {solvers.map((solver) => {
                    const imgSrc = solver.image ? `/uploads/user/${solver.image}` : "/avatar.svg";
                    return (
                        <li key={solver.id} className='bg-neutral-100 p-2 rounded w-full flex flex-row gap-1 relative items-center'>
                            <Image src={imgSrc} alt="avater" width={15} height={15} className='w-8 h-8 rounded-full bg-neutral-400 mr-2 text-color cursor-pointer'></Image>
                            <div>{solver.name} {solver.surname}</div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}