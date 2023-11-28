import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/db";
import { Session, User, getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getMember } from "../../../static";
import { authorize } from "@/app/api/static";

export async function POST(req : Request, { params } : { params: { id: string, board: string } } ) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const { taskId } : { taskId : string } = await req.json();
        
        const res = await prisma.task.delete({
            where: {
               id: taskId 
            }
        });

        if (!res) {
            return Response.json({ error: "This task is not existing"}, { status: 400 });
        } 

        const tasks = await prisma.task.findMany({
            where: {
                taskColumnId: res.taskColumnId
            }
        })


        return Response.json({ tasks: tasks }, { status: 200 });
    } 
    catch (error) {
        console.log(error);
        return Response.json({ error: "Somthing went worng" }, { status: 400 });
    }
}