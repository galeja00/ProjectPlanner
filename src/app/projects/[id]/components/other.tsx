import Image from 'next/image'

export function Head({ text } : { text : string }) {
    return (
        <h1 className=' text-2xl font-bold mb-4'>{text}</h1>
    )
}



export function TeamBadge({ name, color} : { name : string, color : string | null }) {
    const displaydColor = color ?? "#7c3aed"
    const opacityHex = "28";

    return ( 
        <div style={{ backgroundColor: `${displaydColor}${opacityHex}`, color: displaydColor, borderColor: displaydColor}} className='px-1 rounded border text-sm w-fit' >
            {name}
        </div>
    ) 
}


