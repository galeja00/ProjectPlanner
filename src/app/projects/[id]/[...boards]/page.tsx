'use client'
import { Head } from "../components/other";
import Board from "./board";
import Backlog from "./backlog";
import TimeTable from "./timetable";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/app/components/error-handler";

// defalt compenet to decide with board to display
export default function Boards({ params } :  { params: { id : string, boards : string[]}}) {
    var nameOfBoard : string;
    if (params.boards[0] === "") {
        nameOfBoard = "dashboard";
    } else {
        nameOfBoard = params.boards[1];
    }
    const [board, setBoard] = useState<JSX.Element>(<Board id={params.id}/>);

    useEffect(() => {
        switch (nameOfBoard) {
            case "board":
                setBoard(<Board id={params.id}/>);
                break;
            case "timetable":
                setBoard(<TimeTable id={params.id}/>);
                break;
            case "backlog":
                setBoard(<Backlog id={params.id}/>);
                break;
        }
    }, [nameOfBoard]);
    
    
    return (
        <main className="px-14 py-14  w-full overflow-x-hidden relative">
            <ErrorBoundary>
                {board}
            </ErrorBoundary>
        </main>
        
    )
}