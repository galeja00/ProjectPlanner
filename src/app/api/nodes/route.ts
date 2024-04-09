import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { prisma } from "@/db";
import { authorize } from "../static";
import { Issue, Project, Ranking, User } from "@prisma/client";



export async function GET(req : Request) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if(!user) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }

        const nodes = await prisma.node.findMany({
            where: {
                userId: user.id
            }
        })

        return Response.json({ nodes: nodes }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: error }, { status: 500 })
    }
    
} 