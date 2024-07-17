import { authorize } from "@/app/api/static";
import { getMember } from "../../../../static";
import { ProjectMember, Task, TaskSolver } from "@prisma/client";
import { prisma } from "@/db";
import { ErrorMessagges } from "@/app/api/error-messages";

// add member of project ass solver of task
export async function POST(req : Request, { params } : { params : { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: ErrorMessagges.Authorize }, { status: 400 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: ErrorMessagges.MemberProject }, { status: 400 });
        }

        const { task, memberId } = await req.json();

        await prisma.taskSolver.create({
            data: {
                memberId: memberId,
                taskId: task.id
            }
        })

        return Response.json({ solver: "Succesfully added"}, {status: 200 }); 
    }
    catch (error) {
        console.error(error);
        return Response.json({error: ErrorMessagges.Server}, {status: 400});
    }
}
