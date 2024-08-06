import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/db";
import { Task, TaskColumn, TasksGroup, TaskSolver } from "@prisma/client";
import { Session, User, getServerSession } from "next-auth";
import { getMember } from "../../../static";
import { authorize } from "@/app/api/static";
import { ErrorMessagges } from "@/error-messages";

// create new column on Board to insert tasks
export async function POST(req : Request, { params } : { params: { id: string, board: string } } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: ErrorMessagges.Authorize }, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ message: ErrorMessagges.MemberProject}, { status: 400 });
        }

        const { name } = await req.json();

        const board = await prisma.board.findFirst({
            where: {
                projectId: params.id
            }
        })


        if (!board) {
            return Response.json({ message: "This board dosn't exist"}, { status: 400 })
        }

        const num : number = await prisma.taskColumn.count({
            where: {
                boardId: board.id
            }
        })

        const col : TaskColumn = await prisma.taskColumn.create({
            data: {
                boardId: board.id,
                name: name,
                position: num
            }
        })

        if (col) {
            return Response.json({ message: "Collumn succesfully created" }, { status: 200 })
        }
           
    }
    catch (error) {
        console.log(error);
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 });
    }
}