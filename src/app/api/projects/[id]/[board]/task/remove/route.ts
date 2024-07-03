import { prisma } from "@/db";
import { getMember } from "../../../static";
import { authorize } from "@/app/api/static";
import { Task } from "@prisma/client";
import { movAwayColumnIndexes, movInColumnIndexes } from "../static";
import { BoardsTypes } from "../../board";


// Remove task from Board Col
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
    
        let res : Task | null = null;
        if (BoardsTypes.Board == params.board) {
            res = await prisma.task.update({
                where: {
                   id: taskId 
                },
                data: {
                    taskColumnId: null
                }
            });
            if (!res) {
                return Response.json({ error: "This task is not existing"}, { status: 400 });
            } 
            if (res.taskColumnId && res.colIndex) {
                await movAwayColumnIndexes(res.taskColumnId, res);
            }
            const finalTasks = await prisma.task.findMany({
                where: {
                    taskColumnId: res.taskColumnId
                },
                orderBy: {
                    colIndex: "asc"
                }
            })
            return Response.json({ tasks: finalTasks }, { status: 200 });
        } else if (BoardsTypes.Backlog == params.board) {
            res = await prisma.task.update({
                where: {
                   id: taskId 
                },
                data: {
                    tasksGroupId: null
                }
            });
            if (!res) {
                return Response.json({ error: "This task is not existing"}, { status: 400 });
            } 
            if (res.taskColumnId && res.colIndex) {
                await movAwayColumnIndexes(res.taskColumnId, res);
            }
            const finalTasks = await prisma.task.findMany({
                where: {
                    tasksGroupId: res.tasksGroupId
                }
            })
            return Response.json({ tasks: finalTasks }, { status : 200 });
        } else {
            return Response.json({ error: "On this board you cant remove task" }, { status: 400 });
        }
    } 
    catch (error) {
        console.log(error);
        return Response.json({ error: "Somthing went worng" }, { status: 400 });
    }
}
