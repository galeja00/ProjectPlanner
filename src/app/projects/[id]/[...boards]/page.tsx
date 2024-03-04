'use client'
import { Head } from "../components/other";
import Board from "./board";
import Backlog from "./backlog";
import TimeTable from "./timetable";
import Dashboard from "./dashboard";
import { useEffect, useState } from "react";

export default function Boards({ params } :  { params: { id : string, boards : string[]}}) {
    var nameOfBoard : string;
    if (params.boards[0] === "") {
        nameOfBoard = "dashboard";
    } else {
        nameOfBoard = params.boards[1];
    }
    const [board, setBoard] = useState<JSX.Element>(<Dashboard/>);

    useEffect(() => {
        switch (nameOfBoard) {
            case "board":
                setBoard(<Board id={params.id}/>);
                break;
            case "timetable":
                setBoard(<TimeTable/>);
                break;
            case "backlog":
                setBoard(<Backlog id={params.id}/>);
                break;
        }
    }, [nameOfBoard]);
    
    
    return (
        <main className="px-14 py-14 relative w-full">
            {board}
        </main>
        
    )
}