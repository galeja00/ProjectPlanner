import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/db";
import { Task, TaskColumn } from "@prisma/client";
import { Session, User, getServerSession } from "next-auth";
import { getMember } from "../../../static";
import { authorize } from "@/app/api/static";

export async function POST(req : Request, { params } : { params: { id: string, board: string , type: string} } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const { name, colId } = await req.json();
        const type = "test"; // TODO: typ of task, "test" = only placeholder

        if (!(name || colId)) {
            return Response.json({ error: "Bad reqest: You need specify name and colId in data segment"}, { status: 400 });
        }

        const tasksCol : TaskColumn | null = await prisma.taskColumn.findFirst({ 
            where: { 
                id: colId
            }
        });
        if (!tasksCol) {
            return Response.json({ error: "Bad reqest: this column dosnt exist"}, { status: 400 });
        }

        await prisma.taskColumn.update({
            where: {
                id: colId
            },
            data: {
                numOfTasks: tasksCol.numOfTasks + 1
            }
        })

        // TODO: Argument `name`: Invalid value provided. Expected String, provided Object.
        const task : Task = await prisma.task.create({
            data: {
                name: name,
                type: type, 
                taskColumnId: colId,
                projectMemberId: member.id
            }
        })

        return Response.json({ task: task }, { status: 200 })
    }
    catch (error) {
        console.log(error);
        return Response.json({ error : "Error on server try again"}, { status: 400});
    }
}