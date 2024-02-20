import { Project, ProjectInvite } from "@prisma/client";
import { prisma } from "@/db";
import { DateTime } from "next-auth/providers/kakao";
import { authorize, getUserId } from "../../static";

type Notification = {
    id : string,
    projectId : string,
    name : string,
    icon : string | null,
    type : NotificationTypes,
    agoInHours : number,
    displayd : boolean
}

enum NotificationTypes {
    ProjectInvite = "ProjectInvite"
}

export async function GET(req : Request, { params } : { params : { id : string }}) {
    try {
        const email : string | null = await authorize(req);
        if (email == null) {
            return Response.json({ error: ""}, { status: 400 });
        }
        const id : string | null = await getUserId(email);
        if (id == null) {
            return Response.json({ error: ""}, { status: 400 });
        }
        
        const notifications : Notification[] = [];
        const projectInvites : ProjectInvite[] = await prisma.projectInvite.findMany({
            where: {
                invitedUserId: id
            }
        })

        for (const projectInvite of projectInvites) {
            const project : Project | null = await prisma.project.findFirst({
                where: {
                    id: projectInvite.projectId
                },
            })
            if (project == null) {
                throw new Error();
            }
            const currentDate: Date = new Date();
            const timeDifferenceInHours = Math.floor((currentDate.getTime() - projectInvite.createAt.getTime()) / (1000 * 60 * 60));
            //const timeDifferenceInHours = Math.floor(timeDifferenceInMillis / (1000 * 60 * 60));
            
            const notif : Notification = { 
                id:  projectInvite.id, 
                projectId: projectInvite.projectId,
                type: NotificationTypes.ProjectInvite, 
                agoInHours: timeDifferenceInHours, 
                displayd: projectInvite.displayed, 
                name: project.name,
                icon: project.icon
            }
            notifications.push(notif);
        }

        return Response.json({ notif: notifications}, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: "" }, { status: 400 });
    }
}