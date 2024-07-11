
import { getMember } from "../../../static";
import { prisma } from "@/db";
import { authorize } from "@/app/api/static";
import { movAwayColumnIndexes,movInColumnIndexes, movToColumnIndexes } from "../static";


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
        //taskID: task s kterou chceme prsunout,
        //fromColID: z jakeho sloupce presunujem task
        //toColID: do jakeho sloupce
        //taskIndex: na jaky index tento ukol umistime
        const { taskId, fromColId, toColId,  taskIndex } : { taskId : string, fromColId : string | null, toColId : string, taskIndex : number | null } = await req.json(); 
        const task = await prisma.task.findFirst({
            where: {
                id: taskId
            },
        });

        if (!task) {
            return Response.json({error: "This task doesn't exist"}, {status : 400});
        }
        
        let index : number;
        if (taskIndex !== null && taskIndex !== undefined) {
            index = taskIndex
        } else {
            index = await prisma.task.count({
                where: {
                    taskColumnId: toColId
                }
            })
        }
        if (fromColId == toColId) {
            await movInColumnIndexes(toColId, task, index);
        } 
        else if (fromColId == null) {
            await movInColumnIndexes(toColId, task, index);
        }
        else {
            await movAwayColumnIndexes(fromColId, task);
            await movToColumnIndexes(toColId, task, index);
        }
        
        const updatedTask = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: {
                taskColumnId: toColId,
                colIndex: taskIndex
            }
        })
        /*
        // for tests
        const updatedColumn = await prisma.task.findMany({
            where: {
                taskColumnId: toColId
            },
            orderBy: {
                colIndex: "asc"
            }
        })
        console.log(updatedColumn);*/
        // TODO: select column update number of tasks
        return Response.json({ task: updatedTask }, { status: 200 });
    }
    catch (error) {
       return Response.json({ error: "Somthing went wrong on server" }, { status: 400 });  
    }
}



