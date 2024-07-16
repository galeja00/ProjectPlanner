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

export function ButtonSideText({ text, image, onClick } : { text : string, image : string, onClick : () => void }) {
    return (
        <div className='flex items-center gap-2'>
            <button onClick={onClick}>
                <Image src={image} alt={text} width={10} height={10} className='w-7 h-7 rounded text-neutral-900 bg-neutral-100 cursor-pointer hover:bg-violet-600 hover:bg-opacity-60 border hover:border-violet-600'></Image>
            </button>
            <p className='text-neutral-400 text-sm'>{text}</p>
        </div>
    )
}

export function TeamBadge({ name, color} : { name : string, color : string | null }) {
    const displaydColor = color ?? "#7c3aed"
    const opacityHex = "66";

    return ( 
        <div style={{ backgroundColor: `${displaydColor}${opacityHex}`, color: displaydColor, borderColor: displaydColor}} className='px-1 rounded border text-sm ' >
            {name}
        </div>
    ) 
}


