
import { authorize } from "@/app/api/static";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/db";
import { getMember } from "../static";
import { Project } from "@prisma/client";

// update project date
export async function POST(req : Request, { params } : { params: { id: string } }) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const { project } : { project : Project } = await req.json(); 

        const updateProj : Project = await prisma.project.update({
            where: {
                id: project.id
            },
            data: {
                name: project.name,
                color: project.color,
                createdAt: project.createdAt,
                done: project.done,
                category: project.category
            }
        })

        return Response.json({ project: updateProj }, { status: 200 });
    } 
    catch (error) {
        return Response.json({ error: ErrorMessagges.Server}, { status: 500 });
    }
    
}
