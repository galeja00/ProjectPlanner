"use client"
import { ErrorBoundary } from "../components/error-handler";
import Profile from "./profile";

export default function Page() {
    return (
        <main className="h-full w-full">
            <ErrorBoundary>
                <Profile/>
            </ErrorBoundary>

        </main>
    )
}