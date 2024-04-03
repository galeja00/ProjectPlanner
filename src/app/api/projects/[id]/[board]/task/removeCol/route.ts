import { prisma } from "@/db";
import { getMember } from "../../../static";
import { authorize } from "@/app/api/static";
import { Task } from "@prisma/client";
import { movAwayColumnIndexes, movInColumnIndexes } from "../static";

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
        
        const res = await prisma.task.update({
            where: {
               id: taskId 
            },
            data: {
                taskColumnId: null
            }
        });

        if (!res) {
            return Response.json({ error: "This task is not existing"}, { status: 500 });
        } 


        if (res.taskColumnId && res.colIndex) {
            await movAwayColumnIndexes(res.taskColumnId, res);
        }
        

        const finalTasks = await prisma.task.findMany({
            where: {
                taskColumnId: res.taskColumnId
            }
        })

        return Response.json({ tasks: finalTasks }, { status: 200 });
    } 
    catch (error) {
        console.log(error);
        return Response.json({ error: "Somthing went worng" }, { status: 400 });
    }
}
