import Board from "./board";

export default function Boards({ params } :  { params: { id : string, boards : string[]}}) {
    return (
        <main className="p-24">
            <h1 className='text-4xl font-bold mb-8'>{params.boards[1]}</h1>
            <Board id={params.id}/>
        </main>
        
    )
}