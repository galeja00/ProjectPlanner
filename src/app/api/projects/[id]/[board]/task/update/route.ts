import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { ProjectMember, Task } from "@prisma/client";
import { prisma } from "@/db";

export async function POST(req : Request, { params } : { params : { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const { task } : { task : Task } = await req.json();

        const res = await prisma.task.update({
            where: {
                id: task.id
            },
            data: {
                name: task.name,
                type: task.type,
                estimatedHours: task.estimatedHours,
                Complexity: task.Complexity,
                description: task.description
            }
        })

        return Response.json({ message: "succesfully updated task" }, { status: 200 });
    } catch (error) {
        return Response.json({ error: "Somthing went wrong" }, { status: 400 });
    }
}