import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/db";
import { Board, ProjectMember, Task, TaskColumn, User } from "@prisma/client";
import { Session } from "next-auth";
import { authorize } from "@/app/api/static";
import { getMember } from "../static";

// TODO: defent boards need to be implement, implmenet type safe api

type BoardTasksColumn = {
    id : string,
    boardId: string,
    name : string,
    num : number,
    tasks : Task[]
}

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
       
        
        const board : Board | null = await prisma.board.findFirst( {
            where: {
                projectId: params.id
            }
        })
        if (!board) {
            return Response.json({ error: "You are not Project member of this project"}, { status: 400 });
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
                }
            })
            boardTasksColumns.push({ id: col.id, name: col.name, boardId: col.boardId, num: col.numOfTasks, tasks: tasks });
        }
        return Response.json({ data: boardTasksColumns }, { status: 200 });
            
        
    } 
    catch (error) {
        console.log(error);
        return Response.json({ error : "Error on server try again"}, { status: 400});
    }
}

