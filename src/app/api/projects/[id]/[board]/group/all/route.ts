import { prisma } from "@/db";
import { Backlog, Board, Kanban, ProjectMember, Task, TaskColumn, TasksGroup, User } from "@prisma/client";
import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { GroupOfTasks } from "../../route";


export async function GET(req : Request, { params } : { params: { id: string, board: string} } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const groups : TasksGroup[] = await prisma.tasksGroup.findMany({
            where: {
                id: params.id
            }
        });
            

        return Response.json({ groups: groups }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ error: "" }, { status: 500 });
    }
}