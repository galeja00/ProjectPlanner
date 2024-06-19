import { Session, getServerSession } from "next-auth";
import { getMember } from "../static";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/db";
import { ProjectMember, User } from "@prisma/client";
import { authorize } from "@/app/api/static";

export enum Load {
    low = 1,
    mid = 2,
    high = 3
}

export type MemberTableInfo = {
    id : string,
    memberId: string,
    name: string,
    surname: string,
    teamId: string | null,
    teamName: string | null,
    image: string | null,
    tasksLoad: Load 
}



export async function GET(req : Request, { params } : { params: { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const membersOfProject : ProjectMember[] = await prisma.projectMember.findMany({
            where: {
                projectId: params.id
            }
        });

        const users : MemberTableInfo[] = []
        for (const member of membersOfProject) {
            const user = await prisma.user.findFirst({
                where: {
                    id: member.userId
                }
            })

            var team = null
            if (member.teamId) {
                team = await prisma.team.findFirst({
                    where: {
                        id: member.teamId
                    }
                })
            }
            if (user) {
                //TODO: math function for load (hours, complexity, avg of members "for solo project some constant (might costumizeble)")
                users.push({ 
                    id: user.id,
                    memberId: member.id, 
                    image: user.image,
                    name: user.name,
                    surname: user.surname,
                    teamId: member.teamId,
                    teamName: team ? team.name : null,
                    tasksLoad: Load.low 
                });
            } 
        }

        return Response.json({ data: users }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: "Somthing went worng" }, { status: 400 });
    }
}