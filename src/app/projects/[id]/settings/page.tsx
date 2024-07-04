"use client"
import { useRouter } from 'next/navigation';
import { Head } from "../components/other";
import Image from "next/image";
import { useEffect, useReducer, useState } from 'react';
import DropImage from '@/app/components/drop-image';

import { Project } from '@prisma/client';
import { formatDate } from '@/date';
import { EditTextButton } from '@/app/components/other';
import { FormItem } from '@/app/components/form';
import { Editor, InputTypes, Selector } from '../components/other-client';

enum Status {
    InWork = "In Work",
    Done = "Done"
}

enum ItemType {
    Text = "text",
    Date = "date",
    Color = "color",
    Select = "select"
}

enum ProjProps {
    Name = "name",
    Category = ""
}

export default function Settings({ params } : { params : { id : string }}) {
    const router = useRouter();
    const [ isImgDrop, toggleImgDrop ] = useReducer(isImgDrop => !isImgDrop, false);
    const [ project, setProject ] = useState<Project | null>(null); 


    async function fetchProjectInfo() {
        try {
            const res = await fetch(`/api/projects/${params.id}`, {
                method: "GET"
            });

            if (!res.ok) {
                return;
            }

            const data = await res.json();
            setProject(data.project);
        }
        catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {fetchProjectInfo()}, []);

    async function updateImg(image : File) {
        try {
            const formData = new FormData();
            formData.append('image', image);
            const res = await fetch(`/api/projects/${params.id}/image `, {
                method: "POST",
                body: formData
            })
            const data = await res.json();
            if (res.ok) {
                if (project) {
                    project.icon = data.icon;
                    setProject(project);
                    toggleImgDrop();
                }
            }
        }
        catch (error) {
            console.error(error); 
        }
    }

    async function handleDelete() {
        try {
            const res = await fetch(`/api/projects/${params.id}/delete`, {
                method: "POST"
            }); 

            if (res.ok) {
                router.push("/projects"); 
                return;
            }

            const data = await res.json();
            throw new Error(data.error);
        }
        catch (error) {
            console.error(error);
        }
    }

    async function updateProject(upProj : Project) {
        try {
            const res = await fetch(`/api/projects/${params.id}/update`, {
                method: "POST",
                body: JSON.stringify({
                    project: upProj
                })
            })

            if (!res.ok) {
                const data = await res.json(); 
                throw new Error(data.error);
            }
            const { project } = await res.json(); 
            setProject(project);
        }
        catch (error) {
            console.error(error);
        }
    }

    function updateVal(val : any, prop : ProjProps) {

    }


    if (!project) {
        return (
            <main className="flex w-2/4 flex-col mx-auto py-14">
                <h1>Loading ...</h1>
            </main>
        )
    }

    const date = new Date(project.createdAt);
    const state = project.done ? Status.Done : Status.InWork;
    const icon = project.icon ? `/uploads/project/${project.icon}` : "/project.svg";

    return (
        <>
            { isImgDrop && <DropImage closeDrop={toggleImgDrop} updateImg={updateImg}/>}
            <main className="flex w-2/4 flex-col mx-auto py-14 ">
            
                <Head text="Settings"/>
                <div className="space-y-8">
                    <section className="bg-neutral-950 p-4 rounded flex gap-8">
                        <Image src={icon} onClick={toggleImgDrop} alt="Project Logo" height={150} width={150} className="bg-neutral-50 rounded w-32 h-32 block hover:outline hover:outline-violet-600 cursor-pointer"/>
                        <div className="space-y-4">
                            <Name name={project.name} update={(val : string) => updateVal(val, ProjProps.Name)}></Name>
                        </div>
                    </section>
                    <section className="bg-neutral-950 p-4 rounded">
                        <ul className="space-y-4">
                            <SettingsItem type={ItemType.Text} text="category" value={project.category}/>
                            <SettingsItem type={ItemType.Date} text="create at" value={formatDate(date)}/>
                            <SettingsItem type={ItemType.Select} text="state" value={state}/>
                            <SettingsItem type={ItemType.Color} text="color" value={project.color}/>
                        </ul>
                    </section>
                    <ButtonDel onClick={handleDelete}/>
                </div>
                
            </main>
        </>
        
    )
}



function Name({ name, update } : { name : string, update : (val : string) => void }) {
    const [ isEditing, toggle ] = useReducer(isEditing => !isEditing, false);

    return (
        <div className='flex gap-4'>
            { !isEditing ? <h1 className="text-2xl font-bold">{name}</h1> : <Editor create={update} endCreate={toggle} type={InputTypes.Text}/> }
            <EditTextButton onClick={toggle}/>
        </div>
        
    )
}

function SettingsItem({ type, text, value } : { type : ItemType, text : string, value : string | null}) {
    const [ isEditing, toggle ] = useReducer(isEditing => !isEditing, false);

    function handleSub(val : string) {
        console.log(val);
    }

    let displayVal : JSX.Element = <div>{value}</div>;
    let inputVal : JSX.Element;
    switch (type) {
        case ItemType.Color:
            inputVal = <Editor create={handleSub} endCreate={toggle} type={InputTypes.Color}/>;
            break;
        case ItemType.Date:
            inputVal = <Editor create={handleSub} endCreate={toggle} type={InputTypes.Date}/>;
            break;
        case ItemType.Select:
            inputVal = <Selector val={value ?? ""} options={["In Work", "Done"]} select={handleSub}  endSelect={toggle}/>;
            break;
        default: 
            inputVal = <Editor create={handleSub} endCreate={toggle} type={InputTypes.Text}/>;
            break;
    }
    
    if (type == ItemType.Color && value) {
       displayVal = <div className="rounded-full w-6 h-6" style={{ backgroundColor: value }}></div>
    }

    return (
        <li className={`grid grid-cols-3 gap-2`}>
            <div>{text}:</div>
            { !isEditing ? displayVal : inputVal }
            { !isEditing ? <EditTextButton onClick={toggle}/> : <></> }
        </li>
    )
}




function ButtonDel({ onClick } : { onClick : () => void }) {
    return (
        <button className="btn-destructive" onClick={onClick}>Delete</button>
    )
}




