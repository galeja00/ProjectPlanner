import { prisma } from "@/db";
import { Backlog, Board, Kanban, ProjectMember, Task, TaskColumn, TasksGroup, User } from "@prisma/client";
import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";


export async function POST(req : Request, { params } : { params: { id: string, board: string} } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const data = await req.json();
        
        const kanban : Kanban | null = await prisma.kanban.findFirst({
            where: {
                projectId: params.id
            }
        })

        if (!kanban || !kanban.backlogId) {
            return Response.json({ error: "" }, { status: 400 });
        }
        

        const position : number = await prisma.tasksGroup.count({
            where: {
                backlogId: kanban.backlogId 
            }
        })
        console.log(data.name);

        const group : TasksGroup = await prisma.tasksGroup.create({
            data: {
                name: data.name,
                backlogId: kanban.backlogId,
                timeTableId: kanban.timetableId ? kanban.timetableId : null,
                position: position
            }
        })

        return Response.json({ group: group }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ error: "" }, { status: 500 });
    }
}