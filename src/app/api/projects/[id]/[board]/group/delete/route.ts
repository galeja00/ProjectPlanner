import { prisma } from "@/db";
import { TasksGroup } from "@prisma/client";
import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";


export async function POST(req : Request, { params } : { params: { id: string, board: string} } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const { id } = await req.json();
        
        const group : TasksGroup | null = await prisma.tasksGroup.findFirst({
            where: {
                id: id
            }
        })

        if (!group) {
            return Response.json({ status: 400 });
        }
        
        await prisma.tasksGroup.updateMany({
            where: {
                backlogId: group.backlogId,
                position: {
                    gt: group.position
                }
            },
            data: {
                position: {
                    decrement: 1 
                }
            }
        })


        await prisma.tasksGroup.delete({
            where: {
                id: id
            }
        })

        await prisma.task.updateMany({
            where: {
                tasksGroupId: id
            },
            data: {
                tasksGroupId: null
            }
        })
        
        return Response.json({ status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ error: "" }, { status: 500 });
    }
}
