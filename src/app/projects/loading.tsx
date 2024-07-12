"use client"
import { Oval } from 'react-loader-spinner'


export default function Loading() {
    return (
        <main className="flex h-screen w-screen flex-col font-bold justify-center items-center text-neutral-200">
            <Oval
                visible={true}
                height="80"
                width="80"
                color={"#e5e5e5"}
                secondaryColor={"#525252"}
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
        </main>
    )
  }