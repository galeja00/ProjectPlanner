import { prisma } from "@/db";
import { Backlog, Board, ProjectMember, Task, TaskColumn, TasksGroup, TimeTable, User } from "@prisma/client";
import { authorize } from "@/app/api/static";
import { getMember } from "../static";
import { unassigned } from "@/config";
import { Group } from "next/dist/shared/lib/router/utils/route-regex";

// TODO: defent boards need to be implement, implmenet type safe api

export type BoardTasksColumn = {
    id : string,
    boardId: string,
    name : string,
    position : number,
    tasks : Task[]
}

export type GroupOfTasks = {
    id : string,
    backlogId : string,
    name : string,
    position : number | null,
    tasks : Task[]
}

export type TimeTableGroup = {
    id: string,
    timeTableId: string,
    name: string,
    position: number | null,
    startAt: Date | null,
    deadlineAt: Date | null
}





// TODO: change querys on DB for better performace 
// TODO: change error throws when query is null
// id: je id daného projektu v kterým 
export async function GET(req : Request, { params } : { params: { id: string, board: string } }) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        switch (params.board) {
            case "board": 
                const board = await getBoard(params.id);
                if (!board) {
                    throw new Error();
                }
                return Response.json({ data: board }, { status: 200 });
            case "backlog": 
                const backlog = await getBacklog(params.id);
                const collumns = await getBoardCollumns(params.id);
                if (!backlog) { 
                    throw new Error(); 
                }
                return Response.json({ backlog: backlog, collumns: collumns }, { status: 200 });
            case "timetable":
                const timeTable = await getTimeTable(params.id); 
                if (!timeTable) { 
                    throw new Error(); 
                }
                console.log(timeTable);
                return Response.json({ start: timeTable.startAt, groups: timeTable.groups }, {status: 200});
            default:
                return Response.json({ error: "Bad type of board in REST API request"}, { status: 400});
        }
        
    } 
    catch (error) {
        console.log(error);
        return Response.json({ error : "Error: Server error"}, { status: 500});
    }
}

async function getTimeTable(projectId: string) {
    const start : { createdAt: Date } | null = await prisma.project.findFirst({
        where: {
            id: projectId
        },
        select: {
            createdAt: true
        }
    });

    if (!start) {
        return null;
    }

    const groups  = await prisma.tasksGroup.findMany({
        where: {
            timeTable: {
                projectId: projectId
            }
        },
        select: {
            id: true,
            timeTableId: true,
            name: true,
            startAt: true,
            position: true,
            deadlineAt: true
        }
    });

    return { startAt: start.createdAt, groups }
}

async function getBoard(projectId : string) : Promise<BoardTasksColumn[] | null> {
    const board : Board | null = await prisma.board.findFirst( {
        where: {
            projectId: projectId
        }
    })
    if (!board) {
        return null
    }

    const taskColumns : TaskColumn[] = await prisma.taskColumn.findMany( {
        where: {
            boardId: board.id
        },
        orderBy: {
            position: 'asc'
        }
    })

    const boardTasksColumns : BoardTasksColumn[] = [];
    for (const col of taskColumns) {
        var tasks : Task[] = await prisma.task.findMany( {
            where: {
                taskColumnId: col.id
            }, 
            orderBy: {
                colIndex: "asc"
            }
        })
        boardTasksColumns.push({ id: col.id, name: col.name, boardId: col.boardId, tasks: tasks, position : col.position });
    }

    return boardTasksColumns;
}

async function getBacklog(projectId : string) : Promise<GroupOfTasks[] | null> {
    let backlog : Backlog | null = await prisma.backlog.findFirst({
        where: {
            projectId: projectId
        }
    }) 
    if (!backlog) {
        backlog = await prisma.backlog.create({
            data: {
                projectId: projectId
            }
        })
        await prisma.kanban.update({
            where: {
                projectId: projectId
            },
            data: {
                backlogId: backlog.id
            }
        })
    }

    const taskGroups : TasksGroup[] = await prisma.tasksGroup.findMany({
        where: {
            backlogId: backlog.id
        },
        orderBy: {
            position: 'asc'
        }
    })

    const groups : GroupOfTasks[] = [];
    for (const group of taskGroups) {
        var tasks : Task[] = await prisma.task.findMany({
            where: {
                tasksGroupId: group.id 
            }
        })
        groups.push({ id: group.id, name: group.name, backlogId: group.backlogId, tasks: tasks, position: group.position });
    }
    var tasks : Task[] = await prisma.task.findMany({
        where: {
            tasksGroupId: null,
            projectId: projectId
        }
    })
    groups.push({ id: unassigned, name: unassigned, backlogId: backlog.id, tasks : tasks, position: null });

    return groups;
}


async function getBoardCollumns(projectId : string) : Promise<TaskColumn[]> {
    const board : Board | null = await prisma.board.findFirst({
        where: {
            projectId: projectId
        }
    })

    if (board == null) {
        return [];
    }

    
    const cols : TaskColumn[] =  await prisma.taskColumn.findMany({
        where: {
            boardId: board.id
        }
    })

    return cols
}