import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { ProjectMember, Task } from "@prisma/client";
import { prisma } from "@/db";

export async function POST(req : Request, { params } : { params : { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "You need to be athorize on web" }, { status: 400 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not project member" }, { status: 400 });
        }

        const { user, task } = await req.json();

        const solver : ProjectMember | null = await prisma.projectMember.findFirst( {
            where: {
                userId: user.id
            }
        })
        if (!solver) {
            return Response.json({ error: "This solver is not existing" }, { status: 400 });
        }

        const custTask : Task = await prisma.task.update({
            where: {
                id: task.id
            },
            data: {
                projectMemberId: solver.id
            }
        })

        return Response.json({status: 200}); 
    }
    catch (error) {

    }
}