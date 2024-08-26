"use client"
import { ChangeEvent, FormEvent, useEffect, useReducer, useState } from "react";
import { Dialog, DialogClose } from "../components/dialog";
import { ArrayButtons, Button, ButtonSideText, ButtonType, Lighteness } from "../components/buttons";
import { FormItem, SubmitButton } from "../components/form";
import { NodeInfo } from "../api/nodes/static";
import { useError } from "../components/error-handler";
import { InitialLoader } from "../components/other-client";
import { formatAgo } from "@/date";
import { DeleteDialog } from "../components/other";

// components to display personal user notes

// main component
export default function Notes() {
    const [ isCreator, toggleCreator ] = useReducer(isCreator => !isCreator, false);  // toggler between modes
    const [ notes, setNotes ] = useState<NodeInfo[]>([]); // state of every note user have
    const [ delNote, setDelNote ] = useState<string | null>(null);
    const { submitError } = useError(); 
    const [ initialLoading, setInitialLoading ] = useState<boolean>(false);

    // fetch data about notes from endpoint
    async function fetchNotes(isInitialLoading : boolean) {
        if (isInitialLoading) {
            setInitialLoading(true);
        }
        try {
            const res = await fetch("/api/nodes", {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message);
            }
      
            setNotes(data.nodes);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => fetchNotes(true));
        }
        finally {
            setInitialLoading(false);
        }

    }

    // delete note by fetching to endpoint
    async function deleteNote(id : string) {
        try {
            const res = await fetch(`/api/nodes/${id}/delete`, {
                method: "POST"
            })
            
            if (!res.ok) {
                const data = await res.json(); 
                throw new Error(data.message);
            }
            const newNotes : NodeInfo[] = [];
            for (let note of notes) {
                if (note.id != id) {
                    newNotes.push(note);
                }
            }
            setNotes(newNotes);
            setDelNote(null);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => deleteNote(id));
        }
    }

    async function onCreate() {
        fetchNotes(false);
        toggleCreator();
    }

    useEffect(() => { fetchNotes(true) }, []);

    if (initialLoading) {
        return (
            <InitialLoader/>
        )
    }

    return (
        <>
            <section>
            { isCreator && <NoteDialog onClose={toggleCreator} onCreate={onCreate}/>}
            { delNote && <DeleteDialog message="Do you really want to delete this Note?" onClose={() => setDelNote(null)} onConfirm={() => deleteNote(delNote)}/>}
                <div className="mb-4">
                    <ButtonSideText text="Create new Note" image={"plus.svg"} onClick={toggleCreator} lightness={Lighteness.Dark} big/>
                </div>
                <ul className="grid grid-cols-2 gap-2">
                    {
                        notes.map((note) => (
                            <NoteComponent key={note.id} note={note} deleteNote={(id : string) => setDelNote(id)} />
                        ))
                    }
                </ul>
                { notes.length == 0 && <div>Currently, you have zero notes.</div>}
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

        if (!header || header.toString().length == 0) {
            submitError("Your input for header of Task is empty", () => handleSubmit(event));
            return
        }
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
                console.error(data.message);
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
            { head && <h2 className="font-bold text-xl mb-4">Create new note</h2>}
            <FormItem item={"Header"} type={"text"} name={"header"} correct={true}/>
            <div className="flex flex-col">
                <label>Description</label>
                <textarea className="input-primary h-32" onChange={handleChange} />
            </div>
            { selector && <SelectorTask/>}
            <SubmitButton text={"Create note"}/>
        </form>
    )
}

function SelectorTask() {
    return (
        <div></div>
    )
}


// display info about note
export function NoteComponent({ note, deleteNote, colorMode = 200 } : { note : NodeInfo, deleteNote : (id : string) => void, colorMode? : number }) {
    const [ editing, setEditing ] = useState<boolean>(false);
    const ago: number = note.createdAgo;
    const agoText: string = formatAgo(ago);

    const buttons : Button[] = [
        //{ onClick: () => setEditing(true), img: "/pencil.svg", title: "Edit Note", size: 8, padding: 1, type: ButtonType.Normal, lightness: Lighteness.Bright},
        { onClick: () => deleteNote(note.id), img: "/x.svg", title: "Delete Note", size: 8, type: ButtonType.Destructive, lightness: Lighteness.Bright}
    ];
    return (
        <>
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
                <p className="p-4" style={{ whiteSpace: 'pre-line' }}>{note.text}</p>
            </li>
            { editing && <NoteEditor note={note} onClose={() => setEditing(false)}/>}
        </>
        
    )
}

export function NoteEditor({ note, onClose } : { note : NodeInfo, onClose : () => void }) {
    return (
        <Dialog>
            <div className="bg-neutral-200 rounded p-4 h-fit relative w-1/3">
                <DialogClose handleClose={onClose}/>
            </div>
        </Dialog>
    )
}

