

import { getServerSession } from "next-auth/next";
import { options } from "../../auth/[...nextauth]/options";
import { prisma } from "@/db";
import { authorize } from "../../static";
import { getMember } from "./static";

export async function GET(req : Request, { params } : { params: { id: string } }) {
    try {
        
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        
        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
        })

        if (!user) {
            return Response.json({ error: "Can not find this user in DB"}, { status: 404 });
        }

        const project = await prisma.project.findFirst({
            where: {
                id: params.id
            }
        })


        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }


        if (!member) {
            return Response.json({ error: "You are not project member of this project"}, { status: 403 });
        }

        return Response.json({ message: "succes", project: project}, { status: 200 });
    } 
    catch (error) {
        return Response.json({ error: error }, { status: 400 });
    }
    
}