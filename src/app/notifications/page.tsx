
import { getServerSession } from "next-auth";
import NotifiactionsList from "./notifications"
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getServerSession(options);

    if (!session) {
        redirect("/auth/signup");
    }
    
    return (
        <main className="w-2/4  m-auto py-14">
            <h1 className='text-2xl font-bold mb-4'>Notificationes</h1>
            <NotifiactionsList/>
        </main>
        
    )
}

