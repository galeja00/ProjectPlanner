import { TaskColumn } from "@prisma/client";

export enum BoardsTypes {
    TimeTable = "timetable",
    Board = "board",
    Backlog = "backlog"
}

// temporary solution for chack if task is in done state
export function isDoneCol(col : TaskColumn) {
    return col.name == "Done";
}