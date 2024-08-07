"use client"

import { ErrorBoundary } from "@/app/components/error-handler"
import Settings from "./settings"


export default function Page({ params } : { params : { id : string }}) {
    return (
        <ErrorBoundary>
            <Settings id={params.id}/>
        </ErrorBoundary>
    )
}
