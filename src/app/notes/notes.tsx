"use client"
import { Node, Task } from "@prisma/client"
import { ChangeEvent, FormEvent, useEffect, useReducer, useState } from "react";
import { Dialog, DialogClose } from "../components/dialog";
import { ArrayButtons, Button, ButtonType, CreateButton, Lighteness } from "../components/buttons";
import { FormItem, SubmitButton } from "../components/form";
import { NodeInfo } from "../api/nodes/static";
import { useError } from "../components/error-handler";
import { InitialLoader } from "../components/other-client";
import { formatAgo } from "@/date";

// components to display personal user nodes

// main component
export default function Notes() {
    const [ isCreator, toggleCreator ] = useReducer(isCreator => !isCreator, false);  // toggler between modes
    const [ notes, setNodes ] = useState<NodeInfo[]>([]); // state of every node user have
    const { submitError } = useError(); 
    const [ initialLoading, setInitialLoading ] = useState<boolean>(false);

    // fetch data about nodes from endpoint
    async function fetchNodes(isInitialLoading : boolean) {
        if (isInitialLoading) {
            setInitialLoading(true);
        }
        try {
            const res = await fetch("/api/nodes", {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            setNodes(data.nodes);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => fetchNodes(true));
        }
        finally {
            setInitialLoading(false);
        }

    }

    // delete node by fetching to endpoint
    async function deleteNode(id : string) {
        try {
            const res = await fetch(`/api/nodes/${id}/delete`, {
                method: "POST"
            })
            
            if (!res.ok) {
                const data = await res.json(); 
                throw new Error(data.error);
            }
            const newNotes : NodeInfo[] = [];
            for (let note of notes) {
                if (note.id != id) {
                    newNotes.push(note);
                }
            }
            setNodes(newNotes);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => deleteNode(id));
        }
    }

    async function onCreate() {
        fetchNodes(false);
        toggleCreator();
    }

    useEffect(() => { fetchNodes(true) }, []);

    if (initialLoading) {
        return (
            <InitialLoader/>
        )
    }

    return (
        <>
            <section>
            { isCreator && <NoteDialog onClose={toggleCreator} onCreate={onCreate}/>}
                <CreateButton text="Create new node" onClick={toggleCreator} />
                <ul className="grid grid-cols-2 gap-2">
                    {
                        notes.map((note) => (
                            <NoteComponent key={note.id} note={note} deleteNode={deleteNode} />
                        ))
                    }
                </ul>
            </section>
        </>
        
    )
}

// open dialog where user can create his personal notes
function NoteDialog({ onCreate, onClose } : { onCreate : () => void, onClose : () => void }) {
    return (
        <Dialog>
            <div className="bg-neutral-200 rounded p-4 h-fit relative w-1/3">
                <DialogClose handleClose={onClose}/>
                <NoteCreator onCreate={onCreate}/>
            </div>
        </Dialog>
    )
}

export function NoteCreator({ onCreate, selector = false, head = true, taskId = null } : { onCreate : () => void, selector? : boolean, head? : boolean, taskId? : string | null}) {
    const [ desc, setDesc ] = useState<string>("");
    const [ selectedTask, setTask ] = useState<string | null>(taskId);
    const { submitError } = useError();
    // handle change of user input
    function handleChange(event : ChangeEvent<HTMLTextAreaElement>) {
        setDesc(event.target.value);
    }
    
    // submiting new user note to endpoint
    async function handleSubmit(event : FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget); 
        const header = formData.get("header");
        console.log(header + " " + desc + " " + selectedTask);
        try {
            const res = await fetch("/api/nodes/create", {
                method: "POST",
                body: JSON.stringify({
                    header: header,
                    desc: desc,
                    taskId: selectedTask
                })
            })
            const data = await res.json(); 
            if (!res.ok) {
                console.error(data.error);
                return;
            }
            onCreate();
        }
        catch (error) {
            console.error(error);
            submitError(error, () => handleSubmit(event));
        }
    }
    
    return ( 
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            { head && <h2 className="font-bold text-xl mb-4">Create new node</h2>}
            <FormItem item={"Header"} type={"text"} name={"header"} correct={true}/>
            <div className="flex flex-col">
                <label>Description</label>
                <textarea className="input-primary h-32" onChange={handleChange} />
            </div>
            { selector && <SelectorTask/>}
            <SubmitButton text={"Create node"}/>
        </form>
    )
}

function SelectorTask() {
    return (
        <div></div>
    )
}


// display info about node
export function NoteComponent({ note, deleteNode, colorMode = 200 } : { note : NodeInfo, deleteNode : (id : string) => void, colorMode? : number }) {
    const ago: number = note.createdAgo;
    const agoText: string = formatAgo(ago);

    const buttons : Button[] = [{ onClick: () => deleteNode(note.id), img: "/x.svg", title: "Delete Node", size: 8, type: ButtonType.Destructive, lightness: Lighteness.Bright}];
    return ( 
        <li key={note.id} className={`bg-neutral-${colorMode} rounded min-h-[8rem]`}>
            <div className="flex justify-between border-b border-neutral-900 p-4 items-center">
                <h3>{note.name}</h3>
                <div className="flex gap-4">
                    <div className="text-neutral-600">
                        {agoText}
                    </div>
                    <ArrayButtons buttons={buttons} gap={1}/>
                </div>
                
            </div>
            <p className="p-4">{note.text}</p>
        </li>
    )
}

