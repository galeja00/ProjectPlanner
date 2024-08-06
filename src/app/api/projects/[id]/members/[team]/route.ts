import { ProjectMember } from "@prisma/client";
import { MemberTableInfo } from "../route"
import { getMember } from "../../static";
import { prisma } from "@/db";
import { authorize } from "@/app/api/static";
import { ErrorMessagges } from "@/error-messages";

// response with all members of team
export async function GET(req : Request, { params } : { params: { id : string, team : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ message: "You are not member of this project"}, { status: 400 });
        }

        const membersOfProject : ProjectMember[] = await prisma.projectMember.findMany({
            where: {
                projectId: params.id,
                teamId: params.team
            }
        });

        const users : MemberTableInfo[] = []
        for (const member of membersOfProject) {
            const user = await prisma.user.findFirst({
                where: {
                    id: member.userId
                }
            })

            let team = null
            if (member.teamId) {
                team = await prisma.team.findFirst({
                    where: {
                        id: member.teamId
                    }
                })
            }
            if (user) {
                users.push({ 
                    id: user.id,
                    memberId: member.id, 
                    image: user.image,
                    name: user.name,
                    surname: user.surname,
                    teamId: member.teamId,
                    teamName: team ? team.name : null,
                    teamColor: team ? team.color : null,
                    tasksLoad: 0
                });
            } 
        }

        return Response.json({ data: users }, { status: 200 });
    }
    catch (error) {
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 });
    }
}