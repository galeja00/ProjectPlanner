import { authorize } from "@/app/api/static";
import { getMember } from "../../static";
import { prisma } from "@/db";
import { Task } from "@prisma/client";

enum TaskFunctions {
    info = "info"
}

export async function GET(req : Request, { params } : { params: { id: string, func: string } }) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const task : Task | null = await findInfo(params.id);
        if (!task) {
            return Response.json({ error: "This task dosen`t exist"}, { status: 400 });
        }
        const Issues = await prisma.issue.findMany({
            where: {
                taskId: params.id
            }
        })

        const Tags = await prisma.tag.findMany({
            where: {
                taskId: params.id
            }
        })

        return Response.json({ task : task }, {status: 200});
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