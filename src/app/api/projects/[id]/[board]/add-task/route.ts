import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/db";
import { Task } from "@prisma/client";
import { Session, User, getServerSession } from "next-auth";

export async function POST(req : Request, { params } : { params: { id: string, board: string } } ) {
    try {
        // TODO: Do abstraction
        const session : Session | null = await getServerSession(options);
        
        if (!(session && session.user)) {
            return Response.json({ error: "You cant get this data if you arent authorize"}, { status: 401 });
        }

        const email = session.user.email;
        
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }

        const user : User | null = await prisma.user.findFirst({
            where: {
                email: email
            },
        })

        if (!user) {
            return Response.json({ error: "Can not find this user in DB"}, { status: 404 });
        }

        const projectMember = await prisma.projectMember.findFirst({
            where: {
                userId: user.id,
                projectId: params.id
            }
        })

        if (!projectMember) {
            return Response.json({ error: "This user is not project member"}, { status: 400 });
        }

        const { name , colId } : { name : string, colId : string} = await req.json();
        console.log("name:", name, "colId:", colId);
        const type = "test"; // TODO: typ of task, "test" = only placeholder
        //const colId = data.Id;

        if (!(name || colId)) {
            return Response.json({ error: "Bad reqest: You need specify name and colId in data segment"}, { status: 400 });
        }

        // TODO: Argument `name`: Invalid value provided. Expected String, provided Object.
        const task : Task = await prisma.task.create({
            data: {
                name: name,
                type: type, 
                taskColumnId: colId,
                projectMemberId: projectMember.id
            }
        })

        return Response.json({ task: task }, { status: 200 })
    }
    catch (error) {
        console.log(error);
        return Response.json({ error : "Error on server try again"}, { status: 400});
    }
}