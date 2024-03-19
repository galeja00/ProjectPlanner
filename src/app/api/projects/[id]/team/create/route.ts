import { authorize } from "@/app/api/static";
import { getMember } from "../../static";
import { Team } from "@prisma/client";
import { prisma } from "@/db";

type MemberInfo = {
    id : string,
    memberId: string,
    name: string,
    surname: string,
    teamId: string | null,
    teamName: string | null,
    position: string | null,
    image: string | null,
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
        const data = await req.json(); 
        const team : Team = await prisma.team.create({
            data: {
                name: data.name,
                projectId: params.id
            }
        })
        for (const member  of data.members) {
            await prisma.projectMember.update({
                where: {
                    id: member.memberId
                },   
                data: {
                    teamId: team.id
                }
            })
        } 
        
        return Response.json({ team : team }, { status: 200 });
    }
    catch (error) {
        return Response.json({error: error}, {status: 400});
    }
}