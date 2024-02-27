"use client"

import { useEffect, useReducer, useState, KeyboardEvent, ChangeEvent } from "react";
import Image from 'next/image' 
import { Issue, Tag, Task, Ranking } from "@prisma/client";

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
            setTask(data.task);
            setTags(data.tags);
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
        <dialog className='absolute z-50 flex bg-neutral-950 bg-opacity-60 left-0 top-0 w-full h-full text-neutral-100 '>
            <div className='bg-neutral-950 rounded w-[80rem] h-[33rem] mx-72 my-36 overflow-hidden relative'>
                { task 
                    ?
                    <>
                        <HeaderContainer task={task} tags={tags} handleClose={() => updateAndClose(task)} updateTask={updateTask}/>
                        <div className='grid grid-cols-3 h-full'>
                            <MainInfoContainer task={task}/>
                            <section className='py-2 px-4  flex flex-col gap-4'>
                                <Data task={task} updateTask={updateTask}/>
                                <Solver/>
                            </section>
                        </div>
                    </>
                    :
                    <>
                        <h3>Loading...</h3>
                        <DialogClose handleClose={handleClose}/>
                    </>
                }
            </div>
        </dialog>
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
    
    function handleNameChange(event : KeyboardEvent<HTMLInputElement>) {
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
                        <input type="text" defaultValue={name} onKeyDown={handleNameChange} className="bg-neutral-950 outline-none border-b text-xl font-bold w-5/6"></input>
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
        catch {

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
            {
                creating ?
                    <TagCreator handleCreateTag={handleCreateTag}/>
                    :
                    <></>
            }
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
    const rgbaColor = `${tag.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;

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

function DialogClose({ handleClose } : { handleClose : () => void}) {
    return (
        <button onClick={handleClose} className='absolute right-0 top-0 mt-2 mr-2'><Image src={'/x.svg'} alt={'close'} width={20} height={20}></Image></button>
    )
}

// MAIN INFRMATIONS

enum TypeOfInfo {
    description = "Description",
    issues = "Issues",
    nodes = "Nodes"
}

function MainInfoContainer({ task } : { task : Task }) {
    const menuItems : TypeOfInfo[] = [TypeOfInfo.description, TypeOfInfo.issues, TypeOfInfo.nodes];
    const [actualTypeInfo, setActualInfoType] = useState<TypeOfInfo>(TypeOfInfo.description);
    
    const [actualInfo, setActualInfo] = useState<JSX.Element>(<Description task={task}/>);

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
                setActualInfo(<Description task={task}/>);
                setActualInfoType(TypeOfInfo.description);
        }
    }


    return (
        <section className='col-span-2 border-r border-neutral-400'>
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

function Description({ task } : { task : Task }) {
    var desc = "Create description for better understending of task";
    if (task.description) {
        desc = task.description; 
    } 
    return (
        <article className='m-4'>
            <p className='p-2 bg-neutral-900 rounded '>
                {desc}
            </p>
        </article>
    )
}

function Issues({ issues } : { issues : Issue[] }) {
    return (
        <>
        </>
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

type DataItemType = {
    name : string,
    value : any,
    editing : boolean
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
                <button onClick={changeMode} className="h-fit"><img src="/pencil.svg" alt="Edit Info" className="w-5 h-5"/></button>
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
            case Ranking.heigh:
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
            { name: Ranking.heigh },
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



function Solver() {
    //<button className='btn-primary absolute px-3 py-1 right-0 mr-2'>Change</button>
    return (
        <div>
            <h3 className='font-bold mb-2'>Solver</h3>
            <div className='bg-neutral-900 p-2 rounded w-full flex flex-row gap-1 relative'>
                <Image src="/avatar.svg" alt="avater" width={2} height={2} className='w-8 h-8 rounded-full bg-neutral-300 mr-2 text-color cursor-pointer'></Image>
                <div>Jakub Galeta</div>
                
            </div>
        </div>
    )
}