import { getMember } from "../static";
import { prisma } from "@/db";
import { ProjectMember, User } from "@prisma/client";
import { authorize } from "@/app/api/static";
import { ErrorMessagges } from "@/error-messages";


export type MemberTableInfo = {
    id : string,
    memberId: string,
    name: string,
    surname: string,
    teamId: string | null,
    teamName: string | null,
    teamColor: string | null,
    image: string | null,
    tasksLoad: number 
}

// response with all members of project
export async function GET(req : Request, { params } : { params: { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: ErrorMessagges.Authorize}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: ErrorMessagges.MemberProject}, { status: 400 });
        }

        const membersOfProject : ProjectMember[] = await prisma.projectMember.findMany({
            where: {
                projectId: params.id
            }
        });

        const users : MemberTableInfo[] = []
        for (const member of membersOfProject) {
            const user = await prisma.user.findFirst({
                where: {
                    id: member.userId
                }
            })

            var team = null
            if (member.teamId) {
                team = await prisma.team.findFirst({
                    where: {
                        id: member.teamId
                    }
                })
            }
            if (user) {
                const taskLoad = await prisma.taskSolver.count({
                    where: {
                        memberId: member.id,
                        task: {
                            status: false
                        }
                    }
                })

                users.push({ 
                    id: user.id,
                    memberId: member.id, 
                    image: user.image,
                    name: user.name,
                    surname: user.surname,
                    teamId: member.teamId,
                    teamName: team ? team.name : null,
                    teamColor: team ? team.color : null,
                    tasksLoad: taskLoad
                });
            } 
        }

        return Response.json({ data: users }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: ErrorMessagges.Server }, { status: 500 });
    }
}