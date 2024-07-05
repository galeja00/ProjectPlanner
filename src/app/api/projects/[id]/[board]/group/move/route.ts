import { prisma } from "@/db";
import { Backlog, Board, Kanban, ProjectMember, Task, TaskColumn, TasksGroup, User } from "@prisma/client";
import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { BoardsTypes } from "../../board";
import { group } from "console";

type Range = {
    start : number,
    end : number,
}


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

        const { id, newVal } : { id : string, newVal : number }= await req.json();
         
        
        if (newVal < 0) {
            return Response.json({error: "Cant move to possition to neggative numbers"}, { status: 400 });
        }
        const backlog = await prisma.backlog.findFirst({
            where: {
                projectId: params.id
            }
        })

        if (!backlog) {
            return Response.json({ error: "This Time Table don't exist."}, { status: 400 });
        }

        const groups = await prisma.tasksGroup.findMany({
            where: {
                backlogId: backlog.id
            }
        })

        let prevG = groups.find((g) => g.id = id);
        if (!prevG) {
            return Response.json({ error: "This Group don't exist."}, { status: 400 });
        }
        let mov = 1;
        if (newVal > prevG.position) mov = -1; 
        let serchRange = createRange(newVal, prevG.position);
        const moveGroups : TasksGroup[] = groups.filter((g) => isBetweenRangeInclude(serchRange, g.position) && g.id != prevG.id);
        moveGroups.forEach((g) => g.position + mov);
        moveGroups.push({ ...prevG, position: newVal})

        for (const g of moveGroups) {
            prisma.tasksGroup.update({
                where: {
                    id: g.id
                },
                data: {
                    position: g.position
                }
            })
        }
        return Response.json({ message: "Sucesfully moved group" }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ error: "Somthing went wrong" }, { status: 500 });
    }
}


function createRange(a : number, b : number) : Range {
    return { start: a < b ? a : b, end: a < b ? b : a };
}

function isBetweenRangeInclude(range : Range, val : number) : boolean {
    return range.start <= val && range.end >= val;
}