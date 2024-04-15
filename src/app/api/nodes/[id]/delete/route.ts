
import { prisma } from "@/db";
import { authorize } from "../../../static";
import { Node } from "@prisma/client";



export async function POST(req : Request, { params } : { params: { id: string } }) {
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

        const delNode = await prisma.node.delete({
            where: {
                id : params.id,
                userId: user.id
            }
        })
        if (!delNode) {
            return Response.json({ error: ""}, { status: 400 });
        }

        return Response.json({ message: `Succefully deleted node` }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: error }, { status: 500 })
    }
    
} 