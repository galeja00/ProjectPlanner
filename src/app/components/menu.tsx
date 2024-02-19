import { getServerSession } from 'next-auth/next'
import { options } from '../api/auth/[...nextauth]/options'
import Link from 'next/link'
import UserMenu from './user-menu'



export default async function Menu() {
    const session = await getServerSession(options);
    // TODO: insted nodes maybe use issues
    return (
        <header className='flex flex-row items-center sticky gap-4 h-12 bg-neutral-950 border-b border-neutral-600'>
            <div className='w-48 border-r border-neutral-600 h-full flex items-center justify-center'>
                    <Link href="/" className='w-fit h-fit'>Project Planner</Link>
            </div>
            {session ? (
                <nav className='flex flex-row flex-1'>
                    <ul className='flex flex-row flex-1 gap-4'>
                        <LinkTo href="/dashboard" text="Dashboard"></LinkTo>
                        <LinkTo href="/projects" text="Projects"></LinkTo>
                        <LinkTo href="/teams" text="Teams"></LinkTo>
                        <LinkTo href="" text="Nodes"></LinkTo>
                    </ul>
                </nav>
            ) : (
                <></>
            )}
            
            {session ? (
                <UserMenu></UserMenu>
            ) : (
                <Link href="/auth/signin" className='mr-4 link'>Sign in</Link> 
            )}
        </header>
    )
}


export function LinkTo({ href, text } : { href : string, text : string }) : JSX.Element {
    return (
        <li><Link href={href} className='hover:text-violet-500 hover:border-b hover:border-violet-500 ease-in-out'>{text}</Link></li>
    )
}

export function LinkToWithImg({ href, text } : { href : string, text : string }) : JSX.Element {
    return (
        <li><Link href={href} className='hover:text-violet-500 hover:border-b hover:border-violet-500 ease-in-out'>{text}</Link></li>
    )
}

