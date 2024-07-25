import { prisma } from "@/db";
import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { BoardsTypes } from "../../board";
import { ErrorMessagges } from "@/error-messages";

// add already existed group to timetable (possible to add other board)
export async function POST(req : Request, { params } : { params: { id: string, board: string} } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: ErrorMessagges.Authorize }, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: ErrorMessagges.MemberProject }, { status: 400 });
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
                timeTableId: timeTable.id
            }
        })

        return Response.json({ message: "Sucesfully added group" }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ error: ErrorMessagges.Server }, { status: 500 });
    }
}