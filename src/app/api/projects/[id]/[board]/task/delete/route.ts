import { prisma } from "@/db";
import { getMember } from "../../../static";
import { authorize } from "@/app/api/static";
import { Task } from "@prisma/client";
import { movAwayColumnIndexes, movInColumnIndexes } from "../static";
import { BoardsTypes } from "../../board";

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
        
        const res = await prisma.task.delete({
            where: {
               id: taskId 
            }
        });

        if (!res) {
            return Response.json({ error: "This task don't exist"}, { status: 400 });
        } 


        if (res.taskColumnId && res.colIndex) {
            await movAwayColumnIndexes(res.taskColumnId, res);
        }
        

        let resTasks : Task[] = [];
        if (BoardsTypes.Board == params.board) {
            resTasks = await prisma.task.findMany({
                where: {
                    taskColumnId: res.taskColumnId
                },
                orderBy: {
                    colIndex: "asc"
                }
            })
        } else{
            resTasks = await prisma.task.findMany({
                where: {
                    tasksGroupId: res.tasksGroupId
                }
            }) 
        }
        

        return Response.json({ tasks: resTasks }, { status: 200 });
    } 
    catch (error) {
        console.log(error);
        return Response.json({ error: "Somthing went worng" }, { status: 400 });
    }
}
