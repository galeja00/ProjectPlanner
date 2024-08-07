import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/db";
import { Task, TaskColumn, TasksGroup, TaskSolver } from "@prisma/client";
import { getMember } from "../../../static";
import { authorize } from "@/app/api/static";
import { BoardsTypes, isDoneCol } from "../../board";
import { ErrorMessagges } from "@/error-messages";


export async function POST(req : Request, { params } : { params: { id: string, board: string } } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ message: "You are not member of this project"}, { status: 400 });
        }

        const data = await req.json();
        const type = ""; 
        if (data.name.length == 0) {
            return Response.json({ message: "Name of Task can't be empty" }, { status: 400});
        }
        if (params.board == BoardsTypes.Backlog) {
            const tasksGroup : TasksGroup | null = await prisma.tasksGroup.findFirst({
                where: {
                    id: data.groupId
                }
            })
            const task : Task = await prisma.task.create({
                data: {
                    name: data.name,
                    type: type, 
                    tasksGroupId: tasksGroup ? tasksGroup.id : null,
                    projectId: params.id,
                    
                }
            })
            //zakladní řešitel problemu je uživatel který vyvolal tohle api
            await prisma.taskSolver.create({
                data: {
                    memberId: member.id,
                    taskId: task.id
                }
            })
    
            return Response.json({ task: task }, { status: 200 });
        } else if (params.board == BoardsTypes.Board) {
            if (!(data.name || data.colId)) {
                return Response.json({ message: "You need specify name and colId in data segment"}, { status: 400 });
            }
    
            const tasksCol : TaskColumn | null = await prisma.taskColumn.findFirst({ 
                where: { 
                    id: data.colId
                }
            });
            
            
            

            if (!tasksCol) {
                return Response.json({ error: "Bad reqest: this column dosnt exist"}, { status: 400 });
            }

            const isDone = isDoneCol(tasksCol);
    
            // Zvetšení a upraveni indexu tasku
            const colTasks : Task[] = await prisma.task.findMany({
                where: {
                    taskColumnId: data.colId
                }
            })
    
            let index : number = 0;
            for (const task of colTasks) {
                if (task.colIndex !== null && task.colIndex >= index) {
                    index = task.colIndex + 1;
                }
            } 
    
            const task : Task = await prisma.task.create({
                data: {
                    name: data.name,
                    type: type, 
                    taskColumnId: data.colId,
                    projectId: params.id,
                    colIndex: index,
                    status: isDone
                }
            })
    
            await prisma.taskSolver.create({
                data: {
                    memberId: member.id,
                    taskId: task.id
                }
            })
    
            return Response.json({ task: task }, { status: 200 });
        }
        return Response.json({ message: ErrorMessagges.BadRequest}, { status: 400 }); 
    }
    catch (error) {
        console.log(error);
        return Response.json({ message: ErrorMessagges.Server }, { status: 500});
    }
}