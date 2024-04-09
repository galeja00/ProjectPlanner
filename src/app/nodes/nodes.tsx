"use client"
import { Node } from "@prisma/client"
import { useReducer, useState } from "react";
import { Dialog } from "../components/dialog";


export default function Nodes() {
    const [ isCreator, toggleCreator ] = useReducer(isCreator => !isCreator, false);
    const [ nodes, setNodes ] = useState<Node[]>([]); 
    async function fetchNodes() {
        try {
            const res = await fetch("/api/nodes", {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                console.error(data.error);
                return;
            }
            setNodes(data.nodes);
        }
        catch (error) {
            console.error(error);
        }
    }

    async function createNode(name : string, text : string) {
        try {
            const res = await fetch("api/nodes/create", {
                method: "POST",
                body: JSON.stringify({
                    name : name,
                    text : text
                })
            })

            if (res.ok) {
                fetchNodes();
                return;
            }
            const data = await res.json();
            console.error(data.error);
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <section>
            <CreateButton text="Create new Node" onClick={toggleCreator} />
            <ul className="">

            </ul>
        </section>
    )
}

function NodeCreatetor({ onCreate, onClose } : { onCreate : (name :string, text : string)  => void, onClose : () => void }) {
    return (
        <Dialog>
            <div className="">
                <input></input>
                <input></input>
                <button></button>
            </div>
        </Dialog>
    )
}

function CreateButton({ text, onClick } : { text : string, onClick : () => void }) {
    return ( 
        <button>   
            <img src="plus.svg"></img>
        </button>
    )
}