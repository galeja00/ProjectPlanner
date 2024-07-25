import { prisma } from "@/db";
import { authorize, getUserId } from "@/app/api/static";
import { ProjectInvite } from "@prisma/client";
import { ErrorMessagges } from "../../../../error-messages";

// return all project invites
export async function GET(req : Request) {
    try {
        const email : string | null = await authorize(req);
        if (email == null) {
            return Response.json({ error: "You must be authorize"}, { status: 400 });
        }

        const id : string | null = await getUserId(email);
        if (id == null) {
            return Response.json({ error: "You must be authorize"}, { status: 400 });
        }

        const projectInvites : ProjectInvite[] = await prisma.projectInvite.findMany({
            where: {
                invitedUserId: id
            }
        })

        return Response.json({ invites: projectInvites }, { status: 200 });

    } catch (error) {
        console.error(error);
        return Response.json({ error: ErrorMessagges.Server}, { status: 400 });
    }
}