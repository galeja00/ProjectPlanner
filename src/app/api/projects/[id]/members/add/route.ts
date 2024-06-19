import { authorize } from "@/app/api/static";
import { getMember } from "../../static";
import { prisma } from "@/db";
import { ProjectInvite, ProjectMember } from "@prisma/client";

// TODO: Error catching better responses(stattus, error message)
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
        
        const isMember : ProjectMember | null = await prisma.projectMember.findFirst({
            where: {
                userId: data.userId,
                projectId: params.id
            }
        })

        
        if (isMember) {
            return Response.json({ error: "User is allready member" }, { status: 400 });
        }
        const invite : ProjectInvite | null = await prisma.projectInvite.create({
            data: {
                projectId: params.id,
                invitedUserId: data.userId
            }
        })
        if (!invite) {
            return Response.json({ error: "Invite failed to create" }, { status: 500 });
        }

        return Response.json({ message: "Invite succesed" }, { status: 200 });

    } catch (error) {
        return Response.json({ error: "Somthing went wrong" }, { status: 500 });
    }
}