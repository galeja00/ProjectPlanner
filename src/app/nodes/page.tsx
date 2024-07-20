"use client"

import { ErrorBoundary } from "../components/error-handler";
import { Head } from "../projects/[id]/components/other";
import Nodes from "./nodes";

export default function Page() {
    return (
        <main className="h-full w-full py-14 ">
            <div className="max-w-screen-lg w-full mx-auto space-y-8">
                <Head text={"Nodes"}/>
                <ErrorBoundary>
                    <Nodes/>
                </ErrorBoundary>
            </div>
        </main>
    )
}