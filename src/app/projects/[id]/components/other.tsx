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