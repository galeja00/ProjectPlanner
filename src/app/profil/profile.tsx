"use client"

import Image from "next/image"

export default function Profile() {
    async function fetchProfile() {
        try {
            const res = await fetch("/api/profile", {
                method: "GET"
            })
        }
        catch (error) {

        }
    }

    return ( 
        <div className="flex w-2/4 flex-col m-auto py-14">
            <section className="bg-neutral-950 rounded flex gap-16 p-8 mb-8">
                <Image src={"/avatar.svg"} alt={""} height={50} width={50} className="rounded-full bg-neutral-300  w-32 h-32"></Image>
                <div className="flex flex-col gap-4">
                    <h1 className="text-xl font-bold">XXXX XXXX</h1> 
                    <p>xxxxxx@gmail.cz</p>  
                </div>
            </section>
            <section className="bg-neutral-950 rounded p-8 mb-8">
                <h2 className="font-bold mb-4">Invite Id</h2>
                <p>clsyqdehw0000huowt4mkzjdy</p>
            </section>
            <section className="bg-neutral-950 rounded p-8 mb-8">
                <h2 className="font-bold mb-4">Password</h2>
                <p>***********************</p>
            </section>
        </div>
    )
}