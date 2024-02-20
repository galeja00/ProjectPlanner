import Image from 'next/image'


export function ButtonWithImg() {
    return (
        <div className='w-fit h-full'>
            <button className='btn-primary'>
                <Image src="/filter.svg" alt="filter" height={25} width={25} className=' h-5 w-5'/>
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