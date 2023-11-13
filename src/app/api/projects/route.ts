import { NextResponse } from "next/server";
import { options } from '../auth/[...nextauth]/options'
import { prisma } from '@/db'
import { Board, Project, TaskColumn, User } from "@prisma/client";
import { getServerSession } from "next-auth/next"
import { ChildProcessWithoutNullStreams } from "child_process";
import { Session } from "inspector";

// GET: for user will get him all projects he worked on 
export async function GET(req : Request) {
    try {
        const session = await getServerSession(options);
        
        if (!(session && session.user)) {
            return NextResponse.json({ massage: "You cant get this data if you arent authorize"}, { status: 400 })  
        }

        const email = session.user.email;
        if (!email) {
            return NextResponse.json({ massage: "fail"}, { status: 401 })
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
       
        return NextResponse.json({ error: "succes", projects: projects}, { status: 200 })
    } catch {
        return NextResponse.json({ error: "error"}, { status: 400 })
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

async function createStartingBoardTasksColumns(boardId : string) : Promise<void> {
    const colums = await prisma.taskColumn.createMany({
        data: [{
            boardId: boardId,
            name: "To Do",
            numOfTasks: 0,
        },
        {
            boardId: boardId,
            name: "In Work",
            numOfTasks: 0,
        },
        {
            boardId: boardId,
            name: "Done",
            numOfTasks: 0,
        }]
    })
}

// POST: Create new project
// TODO: uprovit misto returnu throw error a pokusit se opravit chybu a zaroven opravir error hlasky
export async function POST(req : Request) {
    try {
        const session = await getServerSession(options);

        if (!(session && session.user)) {
            return NextResponse.json({ error: "You cant create project when you arent authorize"}, { status: 400 })  
        }

        const { name, type } = await req.json();

        const email = session.user.email ?? "";
        const user : User | null = await prisma.user.findFirst({ where: { email: email }});    

        if (!user) {
            return NextResponse.json({ error: "error"}, { status: 400 });
        }

        const proj : Project = await prisma.project.create({ data: {
            name: name,
            type: type,
            color: selectColor()     
        }});


        if (!proj) {
            return NextResponse.json({ error: "error"}, { status: 400 });
        }

        const kanban = await prisma.kanban.create( {
            data: {
                projectId: proj.id,  
            }
        })
        
        const board = await prisma.board.create( {
            data: {
                projectId: proj.id,
            }
        })
        if (!board) {
            return NextResponse.json({ error: "error"}, { status: 400 });
        }

        

        createStartingBoardTasksColumns(board.id);
    
        const projMem = await prisma.projectMember.create({ data: {
            userId: user.id,
            projectId: proj.id,
            creator: true,
            teamId: null
        }});

    
        if (!projMem) {
            return NextResponse.json({ error: "error"}, { status: 400 });
        }

        return NextResponse.json({ message: "Project succesfully created"}, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Comunication on server faild try again later"}, { status: 400 })
    }
}