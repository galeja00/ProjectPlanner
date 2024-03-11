import { options } from "@/app/api/auth/[...nextauth]/options";
import { Session, getServerSession } from "next-auth";
import { getMember } from "../../../static";
import { prisma } from "@/db";
import { authorize } from "@/app/api/static";
import { Task } from "@prisma/client";
import { getColumnsTasks, updateColumnIndexes } from "../static";


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

        const { taskId, fromColId, toColId,  taskIndex } : { taskId : string, fromColId : string, toColId : string, taskIndex : number } = await req.json(); 
        const task = await prisma.task.findFirst({
            where: {
                id: taskId
            },
        });
        if (!task) {
            return Response.json({status : 400});
        }
        updateColumnIndexes(toColId, task, taskIndex, true);
        /*if (task.colIndex && fromColId != toColId) {
            updateColumnIndexes(fromColId, task, task.colIndex, false);
        }*/
        
        const updatedTask = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: {
                taskColumnId: toColId,
                colIndex: taskIndex
            }
        })
        // for tests
        const updatedColumn = await prisma.task.findMany({
            where: {
                taskColumnId: toColId
            },
            orderBy: {
                colIndex: "asc"
            }
        })
        console.log(updatedColumn);
        // TODO: select column update nuber of tasks
        return Response.json({ task: updatedTask }, { status: 200 });
    }
    catch (error) {
       return Response.json({ error: "Somthing went wrong on server" }, { status: 400 });  
    }
}



