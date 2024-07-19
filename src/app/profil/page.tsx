"use client"
import { ErrorBoundary } from "../components/error-handler";
import Profile from "./profile";

export default function Page() {
    return (
        <main className="flex w-2/4 flex-col m-auto py-14">
            <ErrorBoundary>
                <h1 className='text-2xl font-bold mb-4'>Your Profile</h1>
                <Profile/>
            </ErrorBoundary>

        </main>
    )
}