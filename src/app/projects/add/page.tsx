'use client'

import { ProjectType } from "@prisma/client"
import Link from "next/link"
import { useState } from "react"

export default function Add() {
    const [type, setType] = useState<ProjectType | null>(null);
    function hadnleTypeChouce(type : ProjectType) {
        setType(type);
    }
    
    return (
        <main className="flex min-h-screen flex-col items-center p-24 ">
            <h1 className="mb-8">Choose type of project planning</h1> 
            { type == null ? 
            <div className="flex gap-4">
                <div onClick={() => hadnleTypeChouce(ProjectType.Kanban)} className="p-40 bg-neutral-950 rounded cursor-pointer hover:bg-neutral-800">Kanban</div>
                <div onClick={() => hadnleTypeChouce(ProjectType.Kanban)} className="p-40 bg-neutral-950 rounded cursor-pointer hover:bg-neutral-800">Scrum</div>
            </div>
            :
            <form className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <label>Name</label>
                    <input type="text" name="name" className="input-primary"></input>
                </div>
                <button className="btn-primary">Create Project</button>
            </form>
            } 
        </main>
        
    )
}