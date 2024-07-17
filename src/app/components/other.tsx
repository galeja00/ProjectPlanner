import Image from 'next/image'
import { Oval } from 'react-loader-spinner'
import { ButtonWithText } from './buttons'



export function DeleleteDialog({ message, onConfirm, onClose } : { message : string, onConfirm : () => void, onClose : () => void}) {
    return (
        <dialog className='absolute z-50 flex bg-neutral-950 bg-opacity-60 left-0 top-0 w-full h-full text-neutral-100 justify-center items-center'>
            <div className='bg-neutral-950 rounded w-fit h-fit overflow-hidden relative p-8 space-y-8'>
                <h2 className='font-bold text-xl'>{message}</h2>
                <div className='flex gap-2'>
                    <ButtonWithText text={"Yes"} type={"destructive"} handle={onConfirm}/>
                    <ButtonWithText text={"No"} type={"primary"} handle={onClose}/>
                </div>
            </div>
        </dialog>
    )
}

export function EditTextButton({ onClick } : { onClick : () => void}) {
    return (
        <button onClick={onClick} title="Edit Name">
            <Image src={"/pencil.svg"} alt={"custom name"} height={20} width={20}/>
        </button>
    )
}


export function LoadingOval() {
    return (
        <Oval
            visible={true}
            height="80"
            width="80"
            color={"#e5e5e5"}
            secondaryColor={"#525252"}
            ariaLabel="oval-loading"
        />
    )
}
