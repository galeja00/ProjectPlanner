import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { prisma } from "@/db";
import { authorize } from "../../static";
import { Issue } from "@prisma/client";



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

        const userIssue = await prisma.issue.findMany({
            where: {
                creatorId: user.id
            }
        })

        return Response.json({ issues: userIssue }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: error }, { status: 500 })
    }
    
} 