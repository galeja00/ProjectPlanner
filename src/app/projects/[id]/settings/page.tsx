import { Head } from "../components/other";
import Image from "next/image";


export default function Settings() {
    return (
        <main className="flex w-2/4 flex-col mx-auto py-14">
            <Head text="Settings"/>
            <div className="space-y-8">
                <section className="bg-neutral-950 p-8 rounded flex gap-8">
                    <Image src="/project.svg" alt="Project Logo" height={50} width={50} className="bg-neutral-50 rounded w-32 h-32 block"/>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Project Name</h2>
                    </div>
                </section>
                <section className="bg-neutral-950 p-8 rounded">
                    <ul className="space-y-4">
                        <li className="grid grid-cols-3 gap-2"><div>category:</div> <div>undefined</div></li>
                        <li className="grid grid-cols-3 gap-2"><div>create at:</div> <div>10.10.2023</div></li>
                        <li className="grid grid-cols-3 gap-2"><div>state:</div> <div>In Work</div></li>
                        <li className="grid grid-cols-3 gap-2"><div>color:</div> <div className="rounded-full bg-blue-600 w-6 h-6"></div></li>
                    </ul>
                </section>
            </div>
            
        </main>
    )
}