import { prisma } from "@/db";
import { Project, ProjectMember, User } from "@prisma/client";
import { Session, getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";

export async function getMember(email : string, projectId : string) : Promise<ProjectMember | null>  {
    try {
        const user : User | null = await prisma.user.findFirst({
            where: {
                email: email
            },
        });
        if (!user) {
            return null;
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

