import { NextResponse } from "next/server";
import { options } from '../auth/[...nextauth]/options'
import { prisma } from '@/db'
import { Project } from "@prisma/client";
import { getServerSession } from "next-auth/next"

// GET: for user will get him all projects he worked on 
export async function GET(req : Request) {
    try {
        const session = await getServerSession(options);
        
        if (!(session && session.user)) {
            return NextResponse.json({ massage: "You cant get this data if you arent authorize"}, { status: 400 })  
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

enum Color {
    green = "#84CC16",
    red = "#DC2626",
    blue = "#1B4ED8",
    yellow = "#FACC15",
    brown = "#78350F"
}

function selectColor() : string{
    const arrColors : string[] = [Color.blue, Color.brown, Color.green, Color.red, Color.yellow];
    return arrColors[Math.floor(Math.random() * arrColors.length)]
}

// POST: Create new project
// TODO: uprovit mistro returnu trow error a pokusit se opravit chybu
export async function POST(req : Request) {
    try {
        const session = await getServerSession(options);

        if (!(session && session.user)) {
            return NextResponse.json({ error: "You cant create project when you arent authorize"}, { status: 400 })  
        }

        const { name, type } = await req.json();

        const email = session.user.email ?? "";
        const user = await prisma.user.findFirst({ where: { email: email }});    

        if (!user) {
            return NextResponse.json({ error: "error"}, { status: 400 });
        }

        const proj = await prisma.project.create({ data: {
            name: name,
            type: type,
            color: selectColor()     
        }})

        if (!proj) {
            return NextResponse.json({ error: "error"}, { status: 400 });
        }
        
        const projMem = await prisma.projectMember.create({ data: {
            userId: user.id,
            projectId: proj.id,
            creator: true,
            teamId: null
        }})

        if (!projMem) {
            return NextResponse.json({ error: "error"}, { status: 400 });
        }

        return NextResponse.json({ message: "Projectt succesfully created"}, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Comunication on server faild try again later"}, { status: 400 })
    }
}