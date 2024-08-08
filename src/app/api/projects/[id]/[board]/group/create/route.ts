import { prisma } from "@/db";
import { Backlog, Board, Kanban, ProjectMember, Task, TaskColumn, TasksGroup, User } from "@prisma/client";
import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { BoardsTypes } from "../../board";
import { ErrorMessagges } from "@/error-messages";

// creator of new group in backlog
export async function POST(req : Request, { params } : { params: { id: string, board: string} } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: ErrorMessagges.Authorize }, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ message: ErrorMessagges.MemberProject }, { status: 400 });
        }

        const data = await req.json();

        if (data.name.length == 0) {
            return Response.json({ message: "Name of Group can't be empty" }, { status: 400});
        }

        
        
        const kanban : Kanban | null = await prisma.kanban.findFirst({
            where: {
                projectId: params.id
            }
        })

        if (!kanban?.backlogId) {
            return Response.json({ message: ErrorMessagges.BadRequest }, { status: 400 });
        }

        const count = await prisma.tasksGroup.count({
            where: {
                name: data.name,
                backlogId: kanban.backlogId
            }
        })

        if (count > 0) {
            return Response.json({ message: "You can't create two groups with the same name"}, { status: 400 });
        }

        if (!kanban || !kanban.backlogId) {
            return Response.json({ message: ErrorMessagges.BadRequest }, { status: 400 });
        }
        


        const position : number = await prisma.tasksGroup.count({
            where: {
                backlogId: kanban.backlogId 
            }
        })


        let timeTable = null;
        if (params.board == BoardsTypes.TimeTable) {
            timeTable = await prisma.timeTable.findFirst({
                where: {
                    projectId: params.id
                }
            })
        }


        
        const group : TasksGroup = await prisma.tasksGroup.create({
            data: {
                name: data.name,
                backlogId: kanban.backlogId,
                timeTableId: timeTable ? timeTable.id : null,
                position: position
            }
        })

        return Response.json({ group: group }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ message: ErrorMessagges.Server }, { status: 500 });
    }
}