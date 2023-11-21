import { prisma } from "@/db";
import { Project, ProjectMember } from "@prisma/client";

export async function getMember(email : string, projectId : string) : Promise<ProjectMember | null>  {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
        });

        if (!user) {
            throw new Error();
        }
       

        const projectMember : ProjectMember | null = await prisma.projectMember.findFirst({
            where: {
                userId: user.id,
                projectId: projectId
            }
        });

        return projectMember;
    } 
    catch (error) {
        return null;
    }
}