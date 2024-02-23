import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { prisma } from "@/db";
import { Task } from "@prisma/client";

enum TaskFunctions {
    info = "info"
}

export async function GET(req : Request, { params } : { params: { id: string, taskId : string, func: string } }) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const task : Task | null = await findInfo(params.taskId);
        if (!task) {
            return Response.json({ error: "This task dosen`t exist"}, { status: 400 });
        }
        /*
        const issues = await prisma.issue.findMany({
            where: {
                taskId: params.taskId
            }
        })
        */
        const tags = await prisma.tag.findMany({
            where: {
                taskId: params.taskId
            }
        })

        return Response.json({ task : task, tags : tags }, {status: 200});
    } catch (error) {

    }
}

async function findInfo(id : string) : Promise<Task | null> {
    const task = await prisma.task.findFirst({
        where: {
            id: id
        }
    })
    return task
}