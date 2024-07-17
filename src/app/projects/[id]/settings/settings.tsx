"use client"
import { useRouter } from 'next/navigation';
import { Head } from "../components/other";
import Image from "next/image";
import { useEffect, useReducer, useState } from 'react';
import DropImage from '@/app/components/drop-image';
import { Project } from '@prisma/client';
import { formatDate } from '@/date';
import { EditTextButton } from '@/app/components/other';
import { Editor, InputTypes, Selector } from '../components/other-client';
import { InitialLoader } from '@/app/components/other-client';
import { ErrorBoundary, ErrorState, useError } from '@/app/components/error-handler';


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

// init component
export default function Settings({ id } : { id : string}) {
    const router = useRouter();
    const [ isImgDrop, toggleImgDrop ] = useReducer(isImgDrop => !isImgDrop, false); // state if dialog for drop img is open or not
    const [ project, setProject ] = useState<Project | null>(null); //date of project
    const { submitError } = useError() //error state

    // fetch date of project
    async function fetchProjectInfo() {
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "GET"
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            
            setProject(data.project);
        }
        catch (error) {
            console.error(error);
            submitError(error, fetchProjectInfo);
        }
    }

    // initial fetch
    useEffect(() => {fetchProjectInfo()}, []);

    // fetch to upload image to server and change image of project
    async function updateImg(image : File) {
        try {
            const formData = new FormData();
            formData.append('image', image);
            const res = await fetch(`/api/projects/${id}/image `, {
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
            } else {
                throw new Error(data.error);
            }
        }
        catch (error) {
            console.error(error); 
            submitError(error, () => updateImg(image));
        }
    }

    // handle delete of project by fetching to endpoint
    async function handleDelete() {
        try {
            const res = await fetch(`/api/projects/${id}/delete`, {
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
            submitError(error, () => handleDelete());
        }
    }

    // update data of project by fetching to enpoint
    async function updateProject(upProj : Project) {
        try {
            const res = await fetch(`/api/projects/${id}/update`, {
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
            submitError(error, () => updateProject(upProj));
        }
    }

    // update a property of project by key(property) and value with will be asighn 
    function updateVal(key: keyof Project, val: any) {
        if (project) {
            // changing status type to boolean type
            if (key == "done") {
                if (val as Status == Status.Done) {
                    val = true;
                } else {
                    val = false;
                }
            }
            const updatedProject = { ...project, [key]: val };
            setProject(updatedProject);
            updateProject(updatedProject);
        }
    }

    // display loader if data aren loaded
    if (!project) {
        return (
            <main className="flex w-2/4 flex-col mx-auto py-14">
                <InitialLoader/>
            </main>
        )
    }


    const date = new Date(project.createdAt);
    const state = project.done ? Status.Done : Status.InWork;
    const icon = project.icon ? `/uploads/project/${project.icon}` : "/project.svg"; //set path to img

    return (
        <>
            {isImgDrop && <DropImage closeDrop={toggleImgDrop} updateImg={updateImg} />}
            <main className="flex w-2/4 flex-col mx-auto py-14">
                <Head text="Settings" />
                <div className="space-y-8">
                    <section className="bg-neutral-200 p-4 rounded flex gap-8">
                        <Image src={icon} onClick={toggleImgDrop} alt="Project Logo" height={150} width={150} className="bg-neutral-50 rounded w-32 h-32 block hover:outline hover:outline-violet-600 cursor-pointer" />
                        <div className="space-y-4">
                            <Name name={project.name} update={(val: string) => updateVal("name", val)} />
                        </div>
                    </section>
                    <section className="bg-neutral-200 p-4 rounded">
                        <ul className="space-y-4">
                            <SettingsItem propertyKey="category" type={ItemType.Text} text="Category" value={project.category ?? ""} updateVal={updateVal} />
                            <SettingsItem propertyKey="createdAt" type={ItemType.Date} text="Created At" value={formatDate(date)} updateVal={updateVal} />
                            <SettingsItem propertyKey="done" type={ItemType.Select} text="State" value={state} updateVal={updateVal} options={[ Status.InWork, Status.Done ]} />
                            <SettingsItem propertyKey="color" type={ItemType.Color} text="Color" value={project.color} updateVal={updateVal} />
                        </ul>
                    </section>
                    <ButtonDel onClick={handleDelete} />
                </div>
            </main>
        </>
    );
}


// editor of team name
function Name({ name, update } : { name : string, update : (val : string) => void }) {
    const [ isEditing, toggle ] = useReducer(isEditing => !isEditing, false);

    return (
        <div className='flex gap-4'>
            { !isEditing ? <h1 className="text-2xl font-bold">{name}</h1> : <Editor create={update} endCreate={toggle} type={InputTypes.Text}/> }
            <EditTextButton onClick={toggle}/>
        </div>
        
    )
}

// type for createing reuseble component for eazy edititng and sumbiting property value
interface SettingsItemProps {
    propertyKey: keyof Project;
    type: ItemType;
    text: string;
    value: string;
    options?: string[];
    updateVal: (key: keyof Project, val: any) => void;
}

// componenet for settings property
function SettingsItem({propertyKey, type, text, value, options, updateVal} : SettingsItemProps) {
    const [isEditing, toggle] = useReducer((isEditing) => !isEditing, false);

    function handleSub(val: string) {
        toggle();
        updateVal(propertyKey, val);
    }

    let displayVal: JSX.Element = <div>{value}</div>;
    let inputVal: JSX.Element;
    switch (type) {
        case ItemType.Color:
            inputVal = <Editor val={value} create={handleSub} endCreate={toggle} type={InputTypes.Color} />;
            break;
        case ItemType.Date:
            inputVal = <Editor val={value} create={handleSub} endCreate={toggle} type={InputTypes.Date} />;
            break;
        case ItemType.Select:
            const val = value ? Status.Done : Status.InWork;
            inputVal = <Selector val={val} options={options ?? []} select={handleSub} endSelect={toggle}/>
            break;
        default:
            inputVal = <Editor val={value} create={handleSub} endCreate={toggle} type={InputTypes.Text} />;
            break;
    }

    if (type === ItemType.Color && value) {
        displayVal = <div className="rounded-full w-6 h-6" style={{ backgroundColor: value }}></div>;
    }

    return (
        <li className="grid grid-cols-3 gap-2">
            <div>{text}:</div>
            { isEditing ? inputVal: displayVal }
            {!isEditing ? <EditTextButton onClick={toggle} /> : null}
        </li>
    );
}



function ButtonDel({ onClick } : { onClick : () => void }) {
    return (
        <button className="btn-destructive" onClick={onClick}>Delete</button>
    )
}


