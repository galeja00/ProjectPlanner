import { prisma } from "@/db";
import { TasksGroup } from "@prisma/client";
import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { ErrorMessagges } from "@/error-messages";

// response with all groups in project
export async function GET(req : Request, { params } : { params: { id: string, board: string} } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: ErrorMessagges.Authorize }, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ message: ErrorMessagges.MemberProject }, { status: 400 });
        }

        const groups : TasksGroup[] = await prisma.tasksGroup.findMany({
            where: {
                backlog: {
                    projectId: params.id
                }
            },
            orderBy: {
                position: "asc"
            }
        });

        return Response.json({ groups: groups }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({  message: ErrorMessagges.Server }, { status: 500 });
    }
}