
import { authorize } from "@/app/api/static";
import { getMember } from "../../static";
import { prisma } from "@/db";
import { ProjectInvite, ProjectMember } from "@prisma/client";


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

        const data = await req.json();
        
        await prisma.projectMember.delete({
            where: {
                id: data.memberId,
                projectId: params.id
            }
        }) 


        return Response.json({ message: "Member was succesfuly removed" }, { status: 200 });

    } catch (error) {
        return Response.json({ error: "Somthing went wrong :(" }, { status: 400 });
    }
}