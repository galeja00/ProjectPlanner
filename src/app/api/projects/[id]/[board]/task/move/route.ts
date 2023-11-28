import { options } from "@/app/api/auth/[...nextauth]/options";
import { Session, getServerSession } from "next-auth";
import { getMember } from "../../../static";
import { prisma } from "@/db";
import { authorize } from "@/app/api/static";


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

        const { taskId, fromColId, toColId } : { taskId : string, fromColId : string, toColId : string } = await req.json(); 

        const task = await prisma.task.update({
            where: {
                id: taskId,
                taskColumnId: fromColId
            },
            data: {
                taskColumnId: toColId
            }
        })

        // TODO: select column update nuber of tasks
        return Response.json({ task: task }, { status: 200 });
    }
    catch (error) {
       return Response.json({ error: "Somthing went wrong on server" }, { status: 400 });  
    }
}