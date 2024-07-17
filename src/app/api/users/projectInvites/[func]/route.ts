import { ErrorMessagges } from "@/app/api/error-messages";
import { authorize, getUserId } from "@/app/api/static";
import { prisma } from "@/db";
import { ProjectInvite } from "@prisma/client";

enum func {
    accept = "accept",
    decline = "decline"
}
// handle invite of user by creating notification
export async function POST(req : Request, { params } : { params : { func : string }}) {
    try {
        // check if user is signet in
        const email : string | null = await authorize(req);
        if (email == null) {
            return Response.json({ error: "You must be authorize"}, { status: 400 });
        }

        const id : string | null = await getUserId(email);
        if (id == null) {
            return Response.json({ error: "Cant accept invite, this invite is not for you"}, { status: 400 });
        }

        const data = await req.json();
        
        // load Invite from DB
        const invite : ProjectInvite | null = await prisma.projectInvite.findFirst( {
            where: {
                id: data.id
            }
        })

        // check if invite is in DB
        if(invite == null) {
            return Response.json({ error: "This Invite dosn't exist"}, { status: 400 });
        }
        console.log("inviteUserID: " + invite.invitedUserId);
        //
        if(id != invite.invitedUserId) {
            return Response.json({ error: "Invite is not for you"}, { status: 400 });
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
                return Response.json({ error: "This function don't exist" }, { status: 400 });
        }
    } catch (error) {
        console.error(error);
        return Response.json({ error: ErrorMessagges.Server}, { status : 500 });
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