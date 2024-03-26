import { Ranking } from "@prisma/client";

export function PriorityImg({ priority } : { priority : Ranking }) {
    let priorityImg : string = "";
    let priorityClasses : string = "";
    switch (priority) {
        case Ranking.low:
            priorityImg = "/dash.svg";
            priorityClasses = "bg-green-500 border-green-500";
            break;
        case Ranking.medium:
            priorityImg = "/chevron-up.svg"; 
            priorityClasses = "bg-yellow-500 border-yellow-500";
            break
        case Ranking.high:
            priorityImg = "/chevron-double-up.svg";
            priorityClasses= "bg-red-500 border-red-600";
            break;
    }
    return (
        <div className='flex items-center'>
            <img src={priorityImg} alt={priority.toString()} title={`priority: ${priority.toString()}`} className={`stroke-2 p-1 border rounded bg-opacity-20 ${priorityClasses}`}/>
        </div>
    )
}

export function PriorityText({ priority } : { priority : Ranking }) {
    let priorityClasses : string = "";
    switch (priority) {
        case Ranking.low:
            priorityClasses = "text-green-500 bg-green-500 border-green-500";
            break;
        case Ranking.medium:
            priorityClasses = "text-yellow-500 bg-yellow-500 border-yellow-500";
            break
        case Ranking.high:
            priorityClasses= "text-red-500 bg-red-500 border-red-600";
            break;
    }
    return (
        <p className={`flex items-center rounded bg-opacity-20 px-2 border ${priorityClasses}`}>
            {priority}
        </p>
    )
}