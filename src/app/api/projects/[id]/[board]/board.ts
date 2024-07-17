import { TaskColumn } from "@prisma/client";

export enum BoardsTypes {
    TimeTable = "timetable",
    Board = "board",
    Backlog = "backlog"
}

export function isDoneCol(col : TaskColumn) {
    return col.name == "Done";
}