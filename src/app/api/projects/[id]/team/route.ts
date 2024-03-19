import { authorize } from "@/app/api/static";
import { getMember } from "../static";
import { Team } from "@prisma/client";
import { prisma } from "@/db";

type TeamInfo = {
    id : string,
    name: string,
    members: MemberInfo[]
}

type MemberInfo = {
    id : string,
    memberId: string,
    name : string,
    surname : string,
    image : string
}


// TODO: upgreade code to be better optimalized
export async function GET(req : Request ,{ params } : { params: { id: string } }) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }
        const teams : Team[] = await prisma.team.findMany({
            where: {
                projectId: params.id
            }
        })
        const teamsInfo : TeamInfo[] = [];
        for (const team of teams) {
            const teamMembers = await prisma.projectMember.findMany({
                where: {
                    teamId: team.id
                },
                select: {
                    userId: true,
                    id: true
                }
            })
            const members : MemberInfo[] = [];
            for (const member of teamMembers) {
                const info = await prisma.user.findFirst({
                    where: {
                        id: member.userId
                    },
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        image: true
                    }
                })
                if (!info) {
                    continue;
                }
                members.push({ id: info.id, memberId: member.id, name: info.name, surname: info.surname, image: info.surname });
            }
            teamsInfo.push({ id: team.id, name: team.name, members: members});
        }
        
        return Response.json({ teams: teamsInfo }, { status: 200 }); 
    }  
    catch (error) {
        console.error(error);
        return Response.json({ status: 400 });
    }
}

export async function POST(req : Request, { params } : { params: { id: string } }) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }
        
    }
    catch (error) {

    }
}