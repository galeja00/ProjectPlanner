import Teams from "./teams";

export default function Page({ params } : { params : { id : string }}) {
    return (
        <main className="py-14 px-14 relative w-full">
            <Teams projectId={params.id}/>
        </main>
    )
}