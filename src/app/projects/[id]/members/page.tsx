"use client"

import { useState } from "react"

type MemberInfo = {
    name: string,
    surname: string,
    position: string,
    skills: string, //TODO: diferent type
}
// TODO: tags for position "skills"

export default function Members() {
    const [ members, setMember] = useState<MemberInfo>();
    
    async function fetchMembers() {

    }
    
    return (
        <main className="px-14 py-14">
            <h1>Members</h1>
            <TableMembers/>
        </main>
    )
}

function SearchMembers() {

}

function FilterMembers() {

}

function TableMembers() {
    return (
        <table className=" w-max">
            <thead className="w-max">
                <tr>
                    <th>name</th>
                    <th>position</th>
                    <th>skills</th>
                </tr>
            </thead>
            <tbody>

            </tbody>
        </table>
    )
}

function Member({ memberInfo } : { memberInfo : MemberInfo }) {
    return (
        <tr>
            
        </tr>
    )
}