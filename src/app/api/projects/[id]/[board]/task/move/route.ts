import { options } from "@/app/api/auth/[...nextauth]/options";
import { Session, getServerSession } from "next-auth";
import { getMember } from "../../../static";
import { prisma } from "@/db";


export async function POST(req : Request, { params } : { params: { id: string, board: string } } ) {
    try {
        const session : Session | null = await getServerSession(options);
        
        if (!(session && session.user)) {
            return Response.json({ error: "You cant get this data if you arent authorize"}, { status: 401 });
        }

        const email = session.user.email;
        
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

        return Response.json({ task: task }, { status: 200 });
    }
    catch (error) {
       return Response.json({ error: "Somthing went wrong on server" }, { status: 400 });  
    }
}