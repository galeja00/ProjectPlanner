import { authorize } from "@/app/api/static";
import { getMember } from "../static";
import { prisma } from "@/db";
import { Board, TaskColumn } from "@prisma/client";
import { ErrorMessagges } from "@/error-messages";

// return data abou collumns in project
export async function POST(req : Request, { params } : { params: { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const board : Board | null = await prisma.board.findFirst({
            where: {
                projectId: params.id
            }
        })

        if (board == null) {
            return Response.json({ status : 400 });
        }

        const cols : TaskColumn[] =  await prisma.taskColumn.findMany({
            where: {
                boardId: board.id
            }
        })

        return Response.json({ collumns: cols }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: ErrorMessagges.Server}, { status: 500 });
    }
}