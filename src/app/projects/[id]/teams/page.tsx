"use client"

import { ErrorBoundary } from "@/app/components/error-handler";
import Teams from "./teams";

export default function Page({ params } : { params : { id : string }}) {
    return (
        <main className="py-14 px-14 relative w-full">
            <ErrorBoundary>
                <Teams projectId={params.id}/>
            </ErrorBoundary>
        </main>
    )
}