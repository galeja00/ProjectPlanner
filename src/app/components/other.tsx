import Image from 'next/image'
import { Oval } from 'react-loader-spinner'
import { ButtonWithText } from './buttons'
import { Dialog } from './dialog'



export function DeleteDialog({ message, onConfirm, onClose } : { message : string, onConfirm : () => void, onClose : () => void}) {
    return (
        <Dialog>
            <div className='bg-neutral-200 rounded w-fit h-fit overflow-hidden relative p-8 space-y-8'>
                <h2 className='font-bold text-xl'>{message}</h2>
                <div className='flex w-full justify-end gap-2'>
                    <ButtonWithText text={"Yes"} type={"destructive"} handle={onConfirm}/>
                    <ButtonWithText text={"No"} type={"primary"} handle={onClose}/>
                </div>
            </div>
        </Dialog>
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
