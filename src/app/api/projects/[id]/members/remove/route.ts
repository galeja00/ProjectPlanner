import { authorize } from "@/app/api/static";
import { getMember } from "../../static";
import { prisma } from "@/db";
import { ProjectInvite, ProjectMember } from "@prisma/client";

// remove user from project by deleting member
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

        const { memberId } = await req.json();
        if (!memberId) {
            return Response.json({ error: " " }, { status: 400 });
        }
        
        await prisma.projectMember.delete({
            where: {
                id:  memberId,
                projectId: params.id
            }
        }) 


        return Response.json({ message: "Member was succesfuly removed" }, { status: 200 });

    } catch (error) {
        return Response.json({ error: "Somthing went wrong " }, { status: 500 });
    }
}