import { authorize } from "@/app/api/static";
import { getMember } from "../../../../static";
import { prisma} from "@/db";
import { TaskSolver } from "@prisma/client";
import { ErrorMessagges } from "@/error-messages";

export async function POST(req : Request, { params } : { params : { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {   
            return Response.json({ error:  ErrorMessagges.Authorize }, { status: 400 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: ErrorMessagges.MemberProject }, { status: 400 });
        }

        const { task, memberId } = await req.json();

        await prisma.taskSolver.deleteMany({
            where: {
                taskId: task.id,
                memberId: memberId
            }
        })

        return Response.json({ mess: "Succesfull remove" }, {status: 200 }); 
    }
    catch (error) {
        console.log(error);
        return Response.json({error: ErrorMessagges.Server }, {status: 500});
    }
}

