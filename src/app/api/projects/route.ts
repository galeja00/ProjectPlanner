import { NextResponse } from "next/server";
import { options } from '../auth/[...nextauth]/options'
import { prisma } from '@/db'
import { Project } from "@prisma/client";
import { getServerSession } from "next-auth/next"


export  async function GET(req : Request) {
    try {
        const session = await getServerSession(options)
        
        if (!(session && session.user)) {
            return NextResponse.json({ massage: "You cant get this data if you arent loget user"}, { status: 400 })

            
        }

        const email = session.user.email;

        if (!email) {
            return NextResponse.json({ massage: "fail"}, { status: 400 })
        }

        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
            select: {
                id: true
            }
        });

        if (!user) {
            return NextResponse.json({ massage: "error"}, { status: 400 })
        }

        const projectsMem = await prisma.projectMember.findMany({ 
            where: { 
                userId: user.id 
            },
        });

        const projects = new Array<Project>();
        for (const pm of projectsMem) {
            var project = await prisma.project.findFirst({
                where: {
                    id: pm.projectId
                }
            });
            if (project) {
                projects.push(project);
            }
        }
       
        return NextResponse.json({ massage: "succes", projects: projects}, { status: 200 })
    } catch {
        return NextResponse.json({ massage: "error"}, { status: 400 })
    }
    
    
}