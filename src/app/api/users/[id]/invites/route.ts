import { prisma } from "@/db";
import { authorize, getUserId } from "@/app/api/static";
import { ProjectInvite } from "@prisma/client";
import { DateTime } from "next-auth/providers/kakao";

type Notification = {
    type : NotificationTypes,
    name : string,
    text : string,
    image : string,

}

enum NotificationTypes {
    ProjectInvite
}

export async function GET(req : Request, { params } : { params : { id : string }}) {
    try {
        const email : string | null = await authorize(req);
        if (email == null) {
            return Response.json({ error: ""}, { status: 400 });
        }
        const id : string | null = await getUserId(email);
        if (id == null || id != params.id) {
            return Response.json({ error: ""}, { status: 400 });
        }

        const notifications : Notification[] = [];

        const projectInvites : ProjectInvite[] = await prisma.projectInvite.findMany({
            where: {
                invitedUserId: id
            }
        })

        for (const invite of projectInvites) {
            notifications.push({ type: NotificationTypes.ProjectInvite, name: "", text: "", image: "", time: invite.createAt})
        }

    } catch (error) {
        console.error(error);
        return Response.json({error: "Somthing wen wrong on server"}, { status: 400 });
    }
}