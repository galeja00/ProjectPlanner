import { Head } from "../components/other";
import Board from "./board";

export default function Boards({ params } :  { params: { id : string, boards : string[]}}) {
    var board : string;
    if (params.boards[0] === "") {
        board = "dashboard";
    } else {
        board = params.boards[0];
    }
    
    return (
        <main className="px-14 py-14">
            <Head text={params.boards[1]}/>
            <Board id={params.id}/>
        </main>
        
    )
}