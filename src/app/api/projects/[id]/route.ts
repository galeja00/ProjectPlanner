import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next";
import { options } from "../../auth/[...nextauth]/options";
import { prisma } from "@/db";

export async function GET(req : Request, { params } : { params: { id: string } }) {
    try {
        const session = await getServerSession(options);
        
        if (!(session && session.user)) {
            return NextResponse.json({ error: "You cant get this data if you arent authorize"}, { status: 401 })  ;
        }

        const email = session.user.email;
        
        if (!email) {
            return NextResponse.json({ error: "Fail to authorize"}, { status: 401 });
        }
        

        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
        })

        if (!user) {
            return NextResponse.json({ error: "Can not find this user in DB"}, { status: 404 });
        }

        const project = await prisma.project.findFirst({
            where: {
                id: params.id
            }
        })

        if (!project) {
            return NextResponse.json({ error: "This project is no existing"}, { status: 404 });
        }

        const projectMember = await prisma.projectMember.findFirst({
            where: {
                userId: user.id,
                projectId: project.id
            }
        })

        if (!projectMember) {
            return NextResponse.json({ error: "You are not project member of this project"}, { status: 403 });
        }

        return NextResponse.json({ message: "succes", project: project}, { status: 200 });
    } 
    catch (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }
    
}