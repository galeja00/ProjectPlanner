import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { ProjectMember, Task, TaskSolver } from "@prisma/client";
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

        const { task, memberId } = await req.json();

        const newSolver : TaskSolver = await prisma.taskSolver.create({
            data: {
                memberId: memberId,
                taskId: task.id
            }
        })

        return Response.json({ solver: newSolver }, {status: 200 }); 
    }
    catch (error) {
        return Response.json({error: ""}, {status: 400});
    }
}
