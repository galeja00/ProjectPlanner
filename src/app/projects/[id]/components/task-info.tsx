"use client"

import { useEffect, useReducer, useState, KeyboardEvent, ChangeEvent } from "react";
import Image from 'next/image' 
import { Issue, Tag, Task, Ranking } from "@prisma/client";
import { Dialog, DialogClose } from "@/app/components/dialog";
import { Solver } from "@/app/api/projects/[id]/task/[taskId]/[func]/route";


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
            <div className='bg-neutral-950 rounded w-[80rem] h-fit mx-72 my-36 overflow-hidden relative'>
                { task 
                    ?
                    <>
                        <HeaderContainer task={task} tags={tags} handleClose={() => updateAndClose(task)} updateTask={updateTask}/>
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
function HeaderContainer({task, tags, handleClose, updateTask } : {task : Task, tags : Tag[], handleClose : () => void, updateTask : (task : Task) => void}) { 
    function updateName(name : string) {
        task.name = name;
        updateTask(task);
    }

    return (
        <section className='px-6 py-4 border-b border-neutral-400 relative '>
            <Name taskName={task.name} updateName={updateName}/>
            <TagList taskTags={tags}/>
            <DialogClose handleClose={handleClose}/>
        </section>
    )
}
// TODO: submit name to upper component
function Name({taskName, updateName} : {taskName : string, updateName : (name : string) => void}) {
    const [name, setName] = useState<string>(taskName);
    const [isEditing, toggleEdit] = useReducer((isEditing) => !isEditing, false);

    function submitName(val : string) {
        setName(val);
        updateName(val);
    }

    function changeEdit() {
        toggleEdit();
    }
    
    function handleKeyDown(event : KeyboardEvent<HTMLInputElement>) {
        //event.preventDefault();
        const inputValue = event.currentTarget.value;
        if (event.key === 'Enter') {
            if (inputValue.length > 0) {
                submitName(inputValue);
                toggleEdit();
            }
        }
    }
    return (
        <div className="flex mb-4 gap-4">
            {
                isEditing ? 
                    <>
                        <input type="text" defaultValue={name} onKeyDown={handleKeyDown} className="bg-neutral-950 outline-none border-b text-xl font-bold w-5/6"></input>
                    </>
                    :
                    <>
                        <h3 className='text-xl font-bold'>{name}</h3>
                    </>
            }
            <button onClick={changeEdit} title="Edit Name">
                <Image src={"/pencil.svg"} alt={"custom name"} height={20} width={20}/>
            </button>
        </div>
    )
}

function TagList({taskTags} : {taskTags : Tag[]}) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [creating, toggle] = useReducer(creating => !creating, false);
   

    async function handleDeleteTag(delTag : Tag) {
        try {
            /*const res = await fetch("/api/[]/task/tag/delete", {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    color: color
                })
            })*/
            const newTags : Tag[] = [];
            for (const tag of tags) {
                if (tag.id != delTag.id) {
                    newTags.push(tag);
                }
            }
            setTags(newTags);
        }
        catch (error) {
            console.error(error);
        }
    }

    async function handleCreateTag(name : string, color : string) {
        try {
            /*const res = await fetch("/api/[]/task/tag/create", {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    color: color
                })
            })*/
            const id = Math.random().toString();
            const newTags : Tag[] = tags;
            newTags.push({id: id, taskId: "asdads", name: name, color: color});
            setTags(newTags);
            toggle();
        }
        catch {

        }
    }

    return (
        <div className="flex gap-1 h-8">
            <ul className='flex gap-2 rounded-lg '>
                {
                    tags.map((tag) => (
                        <TagElement tag={tag} handleDeleteTag={handleDeleteTag}/>
                    ))
                }
            </ul>
            {creating && <TagCreator handleCreateTag={handleCreateTag}/>}
            <button title="Create Tag" onClick={toggle}>
                <Image src={"/plus.svg"} alt={"create tag"} height={20} width={20}/>
            </button>
        </div>
        
    )
}

function TagCreator({ handleCreateTag } : { handleCreateTag : (name : string, color : string) => void}) {
    const [color, setColor] = useState<string>("#FFFFFF");
    const [name, setName] = useState<string>("");

    function handleColorChange(event: ChangeEvent<HTMLInputElement>) {
        setColor(event.currentTarget.value);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.currentTarget.value);
    }

    return ( 
        <div className="flex gap-2 items-center px-3 py-1 bg-neutral-900 rounded">
            <input type="text" className="bg-neutral-900 outline-none border-b w-32 text-sm h-5 " id="tagName" onChange={handleInputChange}></input>
            <input type="color" value={color} onChange={handleColorChange} className="w-5 h-5 bg-neutral-950 rounded outline-none cursor-pointer"></input>
            <button onClick={() => handleCreateTag(name, color)} className="w-fit h-fit"><Image src={"/check.svg"} alt="submit" height={40} width={40} className="w-5 h-5 rounded bg-neutral-950"></Image></button>
        </div>
    )
}

function TagElement({ tag, handleDeleteTag } : { tag : Tag, handleDeleteTag : (tag : Tag) => void }) {
    const opacity = 0.6; // Průhlednost v rozmezí 0 až 1 (0 - 100%)
    const rgbaColor = `${tag.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`; //Vytvoří hexadecimal zápis pro RGBA

    return (
        <li className='rounded-full border px-3 py-1 flex gap-3 text-sm'
            style={{ backgroundColor: rgbaColor, borderColor: tag.color}}
        >
            {tag.name}
            <button onClick={() => handleDeleteTag(tag)}>
                <Image src={"/x.svg"} alt={"close"} height={5} width={5} className="w-full h-full"/>            
            </button>
        </li>
    )
}



// MAIN INFRMATIONS

enum TypeOfInfo {
    description = "Description",
    issues = "Issues",
    nodes = "Nodes"
}

function MainInfoContainer({ task, updateTask } : { task : Task, updateTask : (task : Task) => void }) {
    const menuItems : TypeOfInfo[] = [TypeOfInfo.description, TypeOfInfo.issues, TypeOfInfo.nodes];
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
                        <MenuItem name={type} actualType={actualTypeInfo} onClick={() => handleChangeType(type)}></MenuItem>
                    ))
                }
            </menu>
            {actualInfo}
        </section>
    )
}

function MenuItem({ name, actualType, onClick } : { name : string, actualType : TypeOfInfo, onClick : () => void}) {
    var bg : string = "bg-neutral-950";
    if (actualType == name) {
        bg = "bg-neutral-900";
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
            <button onClick={toggleEdit} className={`w-fit h-fit flex gap-2 items-center hover:text-neutral-100 text-neutral-400 `}>
                <img src="/pencil.svg" alt="Edit Description" className={`rounded w-7 h-7 ${isEditing ? "bg-violet-600" : "bg-neutral-900"} p-1`}/>
                <div>Edit Description</div>
            </button>
            {
                isEditing ? 
                    <div className="space-y-2">
                        <textarea defaultValue={desc} onChange={handleChange} className="bg-neutral-900 w-full h-64 outline-none rounded focus:ring-1 focus:ring-violet-500 px-3 py-1"/>
                        <div className="flex flex-row-reverse">   
                            <button className="btn-primary relative right-0 bottom-0" onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                    :
                    <div>
                        <p className='px-3 py-1 bg-neutral-900 rounded '>
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
                <button className="bg-neutral-900 rounded" onClick={toggleCreating}>
                    <img src="plus.svg" alt="create"/>
                </button>
                <div>Create new Issue</div>
            </div>
            <ul>
                {
                    issues.map(issue => (
                        <IsssuesItem issue={issue}/>
                    ))
                }
            </ul>
        </div>
    )
}

function IsssuesItem({ issue } : { issue : Issue }) {
    return ( 
        <li key={issue.id}>
            {issue.type}
        </li>
    )
}

function Nodes() {
    return (
        <>
        </>
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
            <ul className='bg-neutral-900 p-2 rounded w-full flex flex-col gap-2'>
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
                    <li id={item.name}>
                        <button 
                            className={`btn btn-primary ${selected  == item.name ? "bg-violet-600 text-neutral-100" : ""} text-xs px-1 py-0.5`} 
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
        <input type={type} defaultValue={value} min={"0"} className="bg-neutral-900 outline-none border-b" onChange={handleChange}></input>
    )
}


//TODO : solover fecth and change it
function Solvers({ task, projectId } : { task : Task, projectId : string }) {
    const [solvers, setSolvers] = useState<Solver[]>([]); 
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

    useEffect(() => { fetchSolvers() }, []);
    return (
        <div>
            <div className="flex gap-2">
                <h3 className='font-bold mb-2'>Solvers</h3>
                <button onClick={fetchSolvers} className="h-fit" title="Edit solvers"><img src="/pencil.svg" alt="Edit Info" className="w-5 h-5"/></button>
            </div>
            <ul className="space-y-2">
                {solvers.map((solver) => {
                    const imgSrc = solver.image ? `/uploads/user/${solver.image}` : "/avatar.svg";
                    return (
                        <li key={solver.id} className='bg-neutral-900 p-2 rounded w-full flex flex-row gap-1 relative items-center'>
                            <Image src={imgSrc} alt="avater" width={15} height={15} className='w-8 h-8 rounded-full bg-neutral-300 mr-2 text-color cursor-pointer'></Image>
                            <div>{solver.name} {solver.surname}</div>
                            <div>{solver.teamId}</div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}