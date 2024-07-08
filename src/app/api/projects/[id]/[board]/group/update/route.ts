import { prisma } from "@/db";
import { Backlog, Board, Kanban, ProjectMember, Task, TaskColumn, TasksGroup, User } from "@prisma/client";
import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { BoardsTypes } from "../../board";


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

        const { id, newVal ,key }  = await req.json();

        if (key != "name") {
            return Response.json({ error: "You cant update this key in Group"}, { status: 200 }); 
        }
        console.log(newVal);
        console.log(key);
        await prisma.tasksGroup.update({
            where: {
                id: id
            },
            data: {
                [key]: newVal
            }
        })
        
        return Response.json({ message: "Sucesfully updated group"  }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ error: "Somthing went wrong" }, { status: 500 });
    }
}