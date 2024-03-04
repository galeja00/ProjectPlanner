import { authorize, getUserId } from "@/app/api/static";
import { prisma } from "@/db";
import { ProjectInvite } from "@prisma/client";

enum func {
    accept = "accept",
    decline = "decline"
}

export async function POST(req : Request, { params } : { params : { func : string }}) {
    try {
        // check if user is signet in
        const email : string | null = await authorize(req);
        if (email == null) {
            return Response.json({ error: ""}, { status: 400 });
        }

        const id : string | null = await getUserId(email);
        if (id == null) {
            return Response.json({ error: ""}, { status: 400 });
        }

        const data = await req.json();
        // load Invite from DB
        const invite : ProjectInvite | null = await prisma.projectInvite.findFirst( {
            where: {
                projectId: data.id
            }
        })
        // check if invite is in DB
        if(invite == null) {
            return Response.json({ error: ""}, { status: 400 });
        }
        //
        if(id != invite.invitedUserId) {
            return Response.json({ error: ""}, { status: 400 });
        }
        // do api function for invite
        switch (params.func) {
            case func.accept:
                acceptInv(invite.invitedUserId, invite.projectId);
                deleteInv(invite.id);
                return Response.json({ mess: "Accepte was succesfull"}, {status: 200});
            case func.decline:
                deleteInv(invite.id);
                return Response.json({ mess: "Decline was succesfull"}, {status: 200});
            default:
                return Response.json({ error: "" }, { status: 400 });
        }
    } catch (error) {
        console.error(error);
        return Response.json({ status : 400});
    }
}

async function acceptInv(userId : string, projectId : string) {
    await prisma.projectMember.create({
        data: {
            userId: userId,
            projectId: projectId
        }
    })
}

async function deleteInv(id : string) {
    await prisma.projectInvite.delete({
        where: {
            id: id
        }
    })
}