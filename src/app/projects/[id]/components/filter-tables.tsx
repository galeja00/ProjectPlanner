import { DialogClose } from '@/app/components/other'
import Image from 'next/image'
import { Ranking, Task} from '@prisma/client'

export function SearchInput() {
    return (
        <search className='flex flex-col'>
            <label className='text-sm text-neutral-400'>Search</label>
            <input className='rounded bg-neutral-950 px-2 py-1 focus:outline focus:outline-2 focus:outline-violet-500'></input>
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

export function FilterDialog({ handleClose } : { handleClose : () => void}) {
    return ( 
        <dialog className="dialog className='absolute z-50 flex bg-neutral-950 bg-opacity-60 left-0 top-0 w-full h-full text-neutral-100">
            <div className='bg-neutral-950 rounded w-[80rem] h-fit mx-72 my-36 overflow-hidden relative'>
                <h2>Filters</h2>
                <DialogClose handleClose={handleClose}/>
                <section>
                    <h3>Priority</h3>
                    <ul>
                        <li>low</li>
                        <li>meddium</li>
                        <li>high</li>
                    </ul>
                </section>
                <section>
                    <h3></h3>
                </section>
            </div>
        </dialog>
    )
}

