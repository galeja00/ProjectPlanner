import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/db";
import { Board, ProjectMember, Task, TaskColumn, User } from "@prisma/client";
import { Session } from "next-auth";

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
        const session : Session | null = await getServerSession(options);
        if (!(session && session.user)) {
            return Response.json({ error: "You cant get this data if you arent authorize"}, { status: 401 });
        }

        const email = session.user.email;
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }

        const user : User | null = await prisma.user.findFirst({
            where: {
                email: email
            },
        })
        if (!user) {
            return Response.json({ error: "Can not find this user in DB"}, { status: 404 });
        }

        const pm : ProjectMember | null = await prisma.projectMember.findFirst({
            where: {
                userId: user.id,
                projectId: params.id
            }
        })
        if (!pm) {
            return Response.json({ error: "You are not Project member of this project"}, { status: 400 });
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

