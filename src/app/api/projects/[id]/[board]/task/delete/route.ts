import { prisma } from "@/db";
import { getMember } from "../../../static";
import { authorize } from "@/app/api/static";
import { Task } from "@prisma/client";
import { movAwayColumnIndexes, movInColumnIndexes } from "../static";
import { BoardsTypes } from "../../board";
import { ErrorMessagges } from "@/app/api/error-messages";

// delete task from project/DB
export async function POST(req : Request, { params } : { params: { id: string, board: string } } ) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const { taskId } : { taskId : string } = await req.json();
        
        const prevRemove = await prisma.task.findFirst({
            where: {
                id: taskId
            }
        })
        if (!prevRemove) {
            return Response.json({ error: "This task don't exist"}, { status: 400 });
        } 

        await prisma.task.delete({
            where: {
               id: taskId 
            }
        });

    
        if (prevRemove.taskColumnId && prevRemove.colIndex) {
            await movAwayColumnIndexes(prevRemove.taskColumnId, prevRemove);
        }
        

        let resTasks : Task[] = [];
        if (BoardsTypes.Board == params.board) {
            resTasks = await prisma.task.findMany({
                where: {
                    taskColumnId: prevRemove.taskColumnId
                },
                orderBy: {
                    colIndex: "asc"
                }
            })
        } else{
            resTasks = await prisma.task.findMany({
                where: {
                    tasksGroupId: prevRemove.tasksGroupId
                }
            }) 
        }
        

        return Response.json({ tasks: resTasks }, { status: 200 });
    } 
    catch (error) {
        console.log(error);
        return Response.json({ error: ErrorMessagges.Server }, { status: 500 });
    }
}
