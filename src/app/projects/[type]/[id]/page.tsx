

export default function Project({ params } : { params: { type: string, id: string } }) {
    return (
        <main className="flex max-w-screen flex-col p-24">
            <h1>{params.id}</h1>
            <p>{params.type}</p>
        </main>
    )
}