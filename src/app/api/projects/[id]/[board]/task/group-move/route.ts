import { prisma } from "@/db";
import { getMember } from "../../../static";
import { authorize } from "@/app/api/static";
import { unassigned } from "@/config";
import { ErrorMessagges } from "@/app/api/error-messages";

// move task between groups
export async function POST(req : Request, { params } : { params: { id: string, board: string } } ) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const { taskId, groupId } : { taskId : string, groupId : string } = await req.json();
        
        let newGroupId : string | null = groupId;
        if (groupId == unassigned) {
            newGroupId = null;
        }
        
        await prisma.task.update({
            where: {
               id: taskId 
            },
            data: {
                tasksGroupId: newGroupId
            }
        });

        return Response.json({ message: "Change of group succed" }, { status: 200 });
    } 
    catch (error) {
        console.log(error);
        return Response.json({ error: ErrorMessagges.Server }, { status: 500 });
    }
}
