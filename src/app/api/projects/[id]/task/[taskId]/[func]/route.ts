import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { prisma } from "@/db";
import { ProjectMember, Tag, Task, TaskSolver } from "@prisma/client";

enum TaskFunctions {
    info = "info",
    solver = "solver"
}

type Solver = {
    id: string,
    memberId: string,
    name: string,
    surname: string,
    image: string | null,
}

type TaskInfo = {
    task: Task,
    tags: Tag[]
}

export async function GET(req : Request, { params } : { params: { id: string, taskId : string, func: string } }) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        switch (params.func) {
            case TaskFunctions.info:
                const taskInfo : TaskInfo | null = await findInfo(params.taskId);
                if (!taskInfo) {
                    return Response.json({ error: "This task dosen`t exist"}, { status: 400 });
                }
                return Response.json({ taskInfo: taskInfo }, {status: 200});
            case TaskFunctions.solver:
                const solvers : Solver[] = await findSolver(params.taskId);
                if (!solvers) {
                    throw new Error();
                }
                return Response.json({ solvers: solvers}, { status: 200});
        }
    } catch (error) {
        return Response.json({ error: ""}, { status: 400 }); 
    }
}

async function findInfo(id : string) : Promise<TaskInfo | null> {
    const task = await prisma.task.findFirst({
        where: {
            id: id
        }
    })
    const tags : Tag[] = await prisma.tag.findMany({
        where: {
            taskId: id
        }
    })
    /*
        const issues = await prisma.issue.findMany({
            where: {
                taskId: params.taskId
            }
        })
        */
    if (!task) {
        return null;
    }
    const taskInfo : TaskInfo = { task: task, tags: tags};
    return taskInfo
}

async function findSolver(id : string) : Promise<Solver[]> {
    
    const task = await prisma.task.findFirst({
        where: {
            id: id
        }
    })
    if(!task) {
        return [];
    }
    const solvers : TaskSolver[] = await prisma.taskSolver.findMany({
        where: {
            taskId: task.id
        }
    })
    const finalSolvers : Solver[] = [];
    for (const x of solvers) {
        const member = await prisma.projectMember.findFirst({
            where: {
                id: x.memberId
            }
        })
        if (!member) {
            continue;
        }
        const user = await prisma.user.findFirst({
            where: {
                id: member.userId
            }
        })
        if (!user) {
            continue;
        }
        const solver : Solver = { 
            id: user.id, 
            memberId: member.id, 
            name: user.name, 
            surname: user.surname,
            image: user.image,
        }
        finalSolvers.push(solver);
    }
    return finalSolvers
}