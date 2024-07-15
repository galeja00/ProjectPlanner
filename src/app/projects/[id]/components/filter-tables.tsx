
import Image from 'next/image'

export function SearchInput() {
    return (
        <search className='flex flex-col'>
            <label className='text-sm text-neutral-400'>Search</label>
            <input className='rounded bg-neutral-200 px-2 py-1 focus:outline focus:outline-2 focus:outline-violet-500'></input>
        </search>
    )
}

export function FilterButton({ onClick } : { onClick : () => void }) {
    return (
        <div className='w-fit h-full'>
            <button className='btn-primary' onClick={onClick}>
                <Image src="/filter.svg" alt="filter" height={25} width={25} className=' h-5 w-5'/>
            </button>
        </div>
    )
}


