
import { prisma } from "@/db";
import { Project, TasksGroup, TimeTable } from "@prisma/client";
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

        const data = await req.json();

        if (!data.id || !((!data.startAt && !data.endAt) || (data.startAt && data.endAt))) {
            return Response.json({ error: "Bad format or missing data"}, { status: 400 });
        }


        const startAt : Date | null = data.startAt ? new Date(data.startAt) : null;
        const endAt : Date | null = data.endAt ? new Date(data.endAt) : null;

        await prisma.tasksGroup.update( {
            where: {
                id: data.id
            },
            data: {
                startAt: startAt,
                deadlineAt: endAt
            }
        })

        return Response.json({ message: "Succesfully updated" }, { status: 200 });

    } catch (error) {
        return Response.json({ error: " " }, { status: 500 });
    }
}