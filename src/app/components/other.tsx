import Image from 'next/image'



export function ButtonWithImg({ image, onClick, alt, title } : { image : string, onClick : () => void, alt : string, title : string }) {
    return (
        <div className='w-fit h-full'>
            <button className='btn-primary' title={title} onClick={onClick}>
                <Image src={image} alt={alt} height={25} width={25} className=' h-5 w-5'/>
            </button>
        </div>
    )
}

export function ButtonWithText({ text, type, handle } : { text : string, type : string, handle : () => void }) {
    return (
        <button className={`btn-${type} h-fit flex flex-col`} onClick={handle}>{text}</button>
    )
}

export function SearchInput() {
    return (
        <search className='flex flex-col'>
            <label className='text-sm text-neutral-400'>Search</label>
            <input className='rounded bg-neutral-950 px-2 py-1 focus:outline focus:outline-2 focus:outline-violet-500'></input>
        </search>
    )
}



export type ButtonItems = {
    name: string,
    onClick: () => void;
    type: string;
}

export function ButtonList({ items } : { items : ButtonItems[]}) {
    return (
        <ul className='flex gap-2'>
            {
                items.map((item) => (
                    <ButtonWithText text={item.name} handle={item.onClick} type={item.type}/>
                ))
            }
        </ul>
    )
}

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

