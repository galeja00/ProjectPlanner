import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { prisma } from "@/db";
import { authorize } from "../static";
import { Node } from "@prisma/client";
import { NodeInfo } from "./static";



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
        const resNodes : NodeInfo[] = [];
        nodes.forEach(node => {
            const currentDate: Date = new Date();
            const timeDifferenceInSec = Math.floor((currentDate.getTime() - node.createdAt.getTime()) / (1000));
            resNodes.push({ id: node.id, name: node.name, text: node.text, createdAgo: timeDifferenceInSec});
        });
        return Response.json({ nodes: resNodes }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: error }, { status: 500 })
    }
    
} 