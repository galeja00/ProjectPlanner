import { Session, getServerSession } from "next-auth";
import { getMember } from "../static";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/db";
import { ProjectMember, User } from "@prisma/client";
import { authorize } from "@/app/api/static";


export async function GET(req : Request, { params } : { params: { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        console.log(params.id);
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }


        const membersOfProject : ProjectMember[] = await prisma.projectMember.findMany({
            where: {
                projectId: params.id
            }
        });

        const users : User[] = []
        for (const member of membersOfProject) {
            const user = await prisma.user.findFirst({
                where: {
                    id: member.userId
                }
            })
            if (user) {
                users.push(user);
            } 
        }
        console.log(users);
        return Response.json({ users: users }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: "Somthing went worng" }, { status: 400 });
    }
}