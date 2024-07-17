import { prisma } from "@/db";
import { getMember } from "../../../static";
import { authorize } from "@/app/api/static";
import { Task } from "@prisma/client";
import { movAwayColumnIndexes, movInColumnIndexes } from "../static";
import { BoardsTypes } from "../../board";
import { ErrorMessagges } from "@/app/api/error-messages";


// remove task from Board Col
export async function POST(req : Request, { params } : { params: { id: string, board: string } } ) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: ErrorMessagges.Authorize }, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: ErrorMessagges.MemberProject }, { status: 400 });
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

        if (prevRemove.taskColumnId && prevRemove.colIndex) {
            await movAwayColumnIndexes(prevRemove.taskColumnId, prevRemove);
        }
        if (BoardsTypes.Board == params.board) {
            await prisma.task.update({
                where: {
                   id: taskId 
                },
                data: {
                    taskColumnId: null,
                    colIndex: null
                }
            });
            
            
            const finalTasks = await prisma.task.findMany({
                where: {
                    taskColumnId: prevRemove.taskColumnId
                },
                orderBy: {
                    colIndex: "asc"
                }
            })
            return Response.json({ tasks: finalTasks }, { status: 200 });
        } else if (BoardsTypes.Backlog == params.board) {
            await prisma.task.update({
                where: {
                   id: taskId 
                },
                data: {
                    tasksGroupId: null,
                    colIndex: null
                }
            });

            const finalTasks = await prisma.task.findMany({
                where: {
                    tasksGroupId: prevRemove.tasksGroupId
                }
            })
            return Response.json({ tasks: finalTasks }, { status : 200 });
        } else {
            return Response.json({ error: ErrorMessagges.BadRequest }, { status: 400 });
        }
        
    } 
    catch (error) {
        console.log(error);
        return Response.json({ error: ErrorMessagges.Server }, { status: 400 });
    }
}
