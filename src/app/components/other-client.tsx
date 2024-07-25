"use client"
import { LoadingOval } from "@/app/components/other"
import { Dialog } from "./dialog"


export function InitialLoader() {
    return ( 
        <div className=' w-full h-full flex justify-center items-center'>
            <LoadingOval/>
        </div>
    )
}

