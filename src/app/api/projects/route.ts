import { NextResponse } from "next/server";
import { options } from '../auth/[...nextauth]/options'
import { prisma } from '@/db'
import { Board, Project, TaskColumn, User } from "@prisma/client";
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

async function createStartingBoard(boardId : string) {
    await prisma.taskColumn.createMany({
        data: [{
            boardId: boardId,
            name: "To Do",
            position: 0,
        },
        {
            boardId: boardId,
            name: "In Work",
            position: 1,
        },
        {
            boardId: boardId,
            name: "Done",
            position: 2
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

        const email = session.user.email ?? "";
        const user : User | null = await prisma.user.findFirst({ where: { email: email }});    
        
        const { name } = await req.json();

        if (!user) {
            return NextResponse.json({ error: "error"}, { status: 400 });
        }
        const project : Project = await prisma.project.create({ data: {
            name: name,
            color: selectColor()     
        }});


        if (!project) {
            return NextResponse.json({ error: "error"}, { status: 400 });
        }

        await prisma.kanban.create( {
            data: {
                projectId: project.id,  
            }
        })

        const board = await prisma.board.create( {
            data: {
                projectId: project.id,
            }
        })

        const backlog = await prisma.backlog.create({
            data: {
                projectId: project.id
            }
        })

        const timetable = await prisma.timeTable.create({
            data: {
                projectId: project.id
            }
        })
        
        await prisma.kanban.update( {
            where: {
                projectId: project.id
            },
            data: {
                boardId: board.id,
                backlogId: backlog.id, 
                timetableId: timetable.id
            }
        })
        
        
        createStartingBoard(board.id);
    
        const projMem = await prisma.projectMember.create({ 
            data: {
                userId: user.id,
                projectId: project.id,
                creator: true,
                teamId: null,
                isAdmin: false
            }});

    
        if (!projMem) {
            return NextResponse.json({ error: "Server siede error"}, { status: 400 });
        }

        return NextResponse.json({ message: "Project succesfully created" }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Comunication on server faild try again later"}, { status: 500 })
    }
}