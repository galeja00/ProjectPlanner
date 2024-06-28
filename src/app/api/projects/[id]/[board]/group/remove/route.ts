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

        const { id } = await req.json();
        
        if (params.board != BoardsTypes.TimeTable) {
            return Response.json({ error: "You can't add group on this board."}, { status: 400 });
        }

        const timeTable = await prisma.timeTable.findFirst({
            where: {
                projectId: params.id
            }
        })

        if (!timeTable) {
            return Response.json({ error: "This Time Table don't exist."}, { status: 400 });
        }

        await prisma.tasksGroup.update({
            where: {
                id: id
            },
            data: {
                timeTableId: null
            }
        })    

        return Response.json({ message: "Sucesfully remuved group"  }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ error: "Somthing went wrong" }, { status: 500 });
    }
}