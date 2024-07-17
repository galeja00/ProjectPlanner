"use client"
import { getServerSession } from "next-auth";
import NotifiactionsList from "./notifications"
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "../components/error-handler";

export default async function Page() {
    const session = await getServerSession(options);

    if (!session) {
        redirect("/auth/signup");
    }
    
    return (
        <main className="flex w-2/4 flex-col m-auto py-14">
            <h1 className='text-2xl font-bold mb-4'>Notificationes</h1>
            <ErrorBoundary>
                <NotifiactionsList/>
            </ErrorBoundary>
        </main>
        
    )
}

