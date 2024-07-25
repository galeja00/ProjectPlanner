import { authorize } from "@/app/api/static";
import { getMember } from "../../static";
import { ProjectMember, Team, User } from "@prisma/client";
import { prisma } from "@/db";
import { ErrorMessagges } from "@/error-messages";


type TeamInfo = {
    id : string,
    name: string,
    members: MemberInfo[],
    taskLoad: number
}

type MemberInfo = {
    id : string,
    memberId: string,
    name : string,
    surname : string,
    image : string | null
}

// response with data of project
export async function GET(req : Request, { params } : { params : { id : string, team : string}}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const team : Team | null = await prisma.team.findFirst({
            where: {
                id: params.id
            }
        })
        if (!team) {
            return Response.json({status: 400});
        }

        const members : ProjectMember[] = await prisma.projectMember.findMany({
            where: {
                teamId: team.id
            }  
        })

        const load : number = await prisma.task.count({
            where: {
                teamId: team.id
            }
        })

        const teamInf : TeamInfo = {id: team.id, name: team.name, members: [], taskLoad: load };
        for (const member of members) {
            const user : User | null = await prisma.user.findFirst({
                where: {
                    id: member.id
                }
            })
            if (user) {
                teamInf.members.push({ id: user.id, memberId: member.id, name: user.id, surname: user.surname, image: user.image });
            }
        }
        return Response.json({ team: teamInf }, { status: 200 });

    }
    catch (error) {
        return Response.json({ error: ErrorMessagges.Server}, { status: 500 });
    }
}