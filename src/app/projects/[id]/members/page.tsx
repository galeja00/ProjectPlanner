"use client"

import { ErrorBoundary } from "@/app/components/error-handler"
import Members from "./members"




export default function Page({ params } : { params : { id : string }}) {
    return (
        <ErrorBoundary>
            <Members id={params.id}/>
        </ErrorBoundary>
    )
}


