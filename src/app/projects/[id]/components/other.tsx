import Image from 'next/image'

export function Head({ text } : { text : string }) {
    return (
        <h1 className=' text-2xl font-bold mb-4'>{text}</h1>
    )
}

export function ButtonWithImg() {
    return (
        <div className='w-fit h-full'>
            <button className='btn-primary'>
                <Image src="/filter.svg" alt="filter" height={25} width={25} className=' h-5 w-5'/>
            </button>
        </div>
    )
}

export function CreateTaskButton({ createTask } : { createTask : () => void }) {
    return (
        <div className='flex items-center gap-2'>
            <button onClick={createTask}>
                <Image src="/plus.svg" alt="add task" width={2} height={2} className='w-7 h-7 rounded bg-neutral-900 cursor-pointer hover:bg-violet-800'></Image>
            </button>
            <p className='text-neutral-400 text-sm'>Create New Task</p>
        </div>
    )
}

export function TeamBadge({ name, color} : { name : string, color : string }) {
    return ( 
        <div className=' px-1 rounded border border-violet-600 bg-violet-600 bg-opacity-60 text-sm'>
            {name}
        </div>
    ) 
}


