"use client"
import { Node } from "@prisma/client"
import { ChangeEvent, FormEvent, useEffect, useReducer, useState } from "react";
import { Dialog, DialogClose } from "../components/dialog";
import { ArrayButtons, Button, ButtonType, CreateButton, Lighteness } from "../components/buttons";
import { FormItem, SubmitButton } from "../components/form";
import { NodeInfo } from "../api/nodes/static";
import { ErrorBoundary, ErrorState } from "../components/error-handler";
import { InitialLoader } from "../components/other-client";

export default function Nodes() {
    const [ isCreator, toggleCreator ] = useReducer(isCreator => !isCreator, false);
    const [ nodes, setNodes ] = useState<NodeInfo[]>([]); 
    const [ error, setError ] = useState<ErrorState | null>(null);
    const [ initialLoading, setInitialLoading ] = useState<boolean>(false);


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
                return;
            }
            setNodes(data.nodes);
        }
        catch (error) {
            console.error(error);
            setError({ error, repeatFunc: () => fetchNodes(true) });
        }
        finally {
            setInitialLoading(false);
        }

    }

    async function deleteNode(id : string) {
        try {
            const res = await fetch(`/api/nodes/${id}/delete`, {
                method: "POST"
            })
            
            if (!res.ok) {
                const data = await res.json(); 
                throw new Error(data.error);
            }
            const newNodes : NodeInfo[] = [];
            for (let node of nodes) {
                if (node.id != id) {
                    newNodes.push(node);
                }
            }
            setNodes(newNodes);
        }
        catch (error) {
            console.error(error);
            setError({ error, repeatFunc: () => deleteNode(id) });
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
        <ErrorBoundary error={error}>
            <section>
            { isCreator && <NodeCreatetor onClose={toggleCreator} onCreate={onCreate}/>}
                <CreateButton text="Create new node" onClick={toggleCreator} />
                <ul className="grid grid-cols-2 gap-2">
                    {
                        nodes.map((node) => (
                            <NodeComponent key={node.id} node={node} deleteNode={deleteNode} />
                        ))
                    }
                </ul>
            </section>
        </ErrorBoundary>
        
    )
}

function NodeCreatetor({ onCreate, onClose } : { onCreate : () => void, onClose : () => void }) {
    const [ desc, setDesc ] = useState<string>("");

    function handleChange(event : ChangeEvent<HTMLTextAreaElement>) {
        setDesc(event.target.value);
    }
    // TODO : optimalizate (not refetch again just update)
    async function handleSubmit(event : FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget); 
        const header = formData.get("header");
        if (header == "") {

        }
        try {
            const res = await fetch("/api/nodes/create", {
                method: "POST",
                body: JSON.stringify({
                    header: header,
                    desc: desc
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
        }
    }
    

    return (
        <Dialog>
            <div className="bg-neutral-200 rounded p-4 h-fit relative w-1/3">
                <DialogClose handleClose={onClose}/>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <h2 className=" font-bold text-xl mb-4">Create new node</h2>
                    <FormItem item={"Header"} type={"text"} name={"header"} correct={true}/>
                    <div className="flex flex-col">
                        <label>Description</label>
                        <textarea className="input-primary h-32" onChange={handleChange} />
                    </div>
                    <SubmitButton text={"Create node"}/>
                </form>
            </div>
        </Dialog>
    )
}



function NodeComponent({ node, deleteNode } : { node : NodeInfo, deleteNode : (id : string) => void }) {
    const ago: number = node.createdAgo;
    const agoText: string = formatAgo(ago);

    const buttons : Button[] = [{ onClick: () => deleteNode(node.id), img: "x.svg", title: "Delete Node", size: 8, type: ButtonType.Destructive, lightness: Lighteness.Bright}];
    return ( 
        <li key={node.id} className="bg-neutral-200 rounded min-h-[8rem]">
            <div className="flex justify-between border-b border-neutral-900 p-4 items-center">
                <h3>{node.name}</h3>
                <div className="flex gap-4">
                    <div className="text-neutral-600">
                        {agoText}
                    </div>
                    <ArrayButtons buttons={buttons} gap={1}/>
                </div>
                
            </div>
            <p className="p-4">{node.text}</p>
        </li>
    )
}


function formatAgo(time: number): string {
    const units = ['sec', 'min', 'h', 'd'];
    let unitIndex = 0;

    while (time >= 60 && unitIndex < units.length - 1) {
        time /= 60;
        unitIndex++;
    }
    time = Math.round(time);
    return `${time} ${units[unitIndex]}`;
}