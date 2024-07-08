"use client"


import { useEffect, useReducer, useState } from "react"
import { Creator } from "../projects/[id]/[...boards]/components/creator"
import { Issue } from "@prisma/client"



export default function Issues() {
    const [ isAll, toggleAll ] = useReducer(isAll => !isAll, false);
    const [ issues, setIssues ] = useState<Issue[]>([]); 
    async function fetchIssues() {
        try {
            const url = `/api/issues${isAll ? "/all" : ""}`;
            const res = await fetch(url, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                console.error(data.error);
                return;
            }
            setIssues(data.issues);
        }
        catch (error) {
            console.error(error);
        }
    }

    async function createIssue() {
        try {

        }
        catch (error) {

        }
    }

    useEffect(() => {
        fetchIssues();
    }, [isAll])

    return (
        <>
            <ModeSwap actual={isAll} handleSwap={toggleAll} />
            <Creator what={"Create new issue"} handleCreate={createIssue}/>
            <ul className="grid grid-cols-2">
                {
                    issues.map((issue) => (
                        <IssueElement key={issue.id} issue={issue} />
                    ))
                }
            </ul>
           
        </>
    )
}

function ModeSwap({ actual, handleSwap } : { actual : boolean, handleSwap : () => void }) {
    return (
        <div className="flex rounded border border-violet-600 w-fit">
            <button className={`px-4 py-2 border-r border-violet-600 ${!actual && "bg-violet-600"}`} onClick={handleSwap}>My</button>
            <button className={`px-4 py-2 border-l border-violet-600 ${actual && "bg-violet-600"}`} onClick={handleSwap}>All</button>
        </div>
    )
}

function IssueElement({ issue } : { issue : Issue }) {
    return  (
        <li key={issue.id} className="bg-neutral-50 rounded">
            <div>
                <h3>{issue.name}</h3>
            </div> 
            <p>{issue.description}</p>
        </li>
    )
    
}

function IsssueCreator() {
    return (
        <></>
    )
}