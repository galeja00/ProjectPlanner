import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { prisma } from "@/db";
import { authorize } from "../static";
import { Node } from "@prisma/client";
import { NodeInfo } from "./static";
import { ErrorMessagges } from "@/error-messages";


// response with all nodes user have
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

        const nodes : Node[] = await prisma.node.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: "asc"
            }
        })

        const resNodes: NodeInfo[] = await Promise.all(nodes.map(async node => {
            const currentDate: Date = new Date();
            const timeDifferenceInSec = Math.floor((currentDate.getTime() - node.createdAt.getTime()) / 1000);
            let task = null;
            if (node.taskId != null) {
                task = await prisma.task.findFirst({
                    where: {
                        id: node.taskId
                    }
                });
            }
            return {
                id: node.id,
                name: node.name,
                text: node.text,
                task: task,
                createdAgo: timeDifferenceInSec
            };
        }));
        return Response.json({ nodes: resNodes }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: ErrorMessagges.Server}, { status: 500 })
    }
    
} 