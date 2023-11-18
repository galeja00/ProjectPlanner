import Board from "./board";

export default function Boards({ params } :  { params: { id : string, boards : string[]}}) {
    return (
        <main className="px-14 py-14">
            <h1 className='text-2xl font-bold mb-4'>{params.boards[1]}</h1>
            <Board id={params.id}/>
        </main>
        
    )
}