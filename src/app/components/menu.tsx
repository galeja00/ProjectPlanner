import { getServerSession } from 'next-auth/next'
import { options } from '../api/auth/[...nextauth]/options'
import Link from 'next/link'
import UserMenu from './user-menu'

export default async function Menu() {
    const session = await getServerSession(options);

    return (
        <header className='w-full flex flex-row items-center relative gap-4 h-12 bg-neutral-200 border-b border-neutral-600 '>
            <div className='w-48 border-r border-neutral-600 h-full flex items-center justify-center'>
                    <Link href="/" className='w-fit h-fit font-bold'>Project Planner</Link>
            </div>
            {session ? (
                <nav className='flex flex-row flex-1'>
                    <ul className='flex flex-row flex-1 gap-4'>
                        <LinkTo href="/projects" text="Projects"></LinkTo>
                        <LinkTo href="/notes" text="Notes"></LinkTo>
                    </ul>
                </nav>
            ) : (
                <></>
            )}
            
            {session ? (
                <UserMenu></UserMenu>
            ) : (
                <div className='w-full flex flex-row-reverse'>
                    <Link href="/auth/signin" className='mr-4 link'>Sign in</Link> 
                </div>
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

