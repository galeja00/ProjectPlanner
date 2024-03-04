import { redirect } from 'next/navigation'


export default function Project({ params } : { params: { id: string } }) {

    redirect(`/projects/${params.id}/boards/dashboard`);

    return (
        <main className="flex max-w-screen flex-col p-24">
            <h1>{params.id}</h1>
        </main>
    )
}