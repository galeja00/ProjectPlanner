"use client"
import { ReactNode } from "react";
import Image from 'next/image'

export function Dialog({children} : {children : ReactNode}) {
    return (
        <dialog className='absolute z-50 flex bg-neutral-900 bg-opacity-60 left-0 top-0 w-full h-full text-neutral-100 justify-center pt-40'>
            {children}
        </dialog>
    )
}

export function DialogClose({ handleClose } : { handleClose : () => void}) {
    return (
        <button onClick={handleClose} className='absolute right-0 top-0 mt-2 mr-2'><Image src={'/x.svg'} alt={'close'} width={20} height={20}></Image></button>
    )
}