"use client"
import { LoadingOval } from "@/app/components/other"


export function InitialLoader() {
    return ( 
        <div className=' w-full h-full flex justify-center items-center'>
            <LoadingOval/>
        </div>
    )
}