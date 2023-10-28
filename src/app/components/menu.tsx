import Link from 'next/link'


export default function Menu() {
    return (
        <header className='flex flex-row items-center sticky gap-4 h-12 flex-1'>
            <div className='pl-4 pr-4 border-r-2'>
                    <Link href="" >Projec Planner</Link>
            </div>
            <nav className='flex flex-row flex-1'>
                <ul className='flex flex-row flex-1 gap-4'>
                    <LinkTo href="" text="Dashboard"></LinkTo>
                    <LinkTo href="" text="Projects"></LinkTo>
                    <LinkTo href="" text="Teams"></LinkTo>
                    <LinkTo href="" text="Nodes"></LinkTo>
                </ul>
            </nav>
            <Link href="/authorize" className='mr-4'>Log in</Link>
        </header>
    )
}


function LinkTo({ href, text } : { href : string, text : string }) : JSX.Element {
    return (
        <Link href={href} >{text}</Link>
    )
}