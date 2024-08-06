
import { prisma } from "@/db";
import { authorize } from "../../../static";



// delete node from DB 
export async function POST(req : Request, { params } : { params: { id: string } }) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: "Fail to authorize"}, { status: 401 });
        }
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if(!user) {
            return Response.json({ message: "Fail to authorize"}, { status: 401 });
        }

        const delNode = await prisma.node.delete({
            where: {
                id : params.id,
                userId: user.id
            }
        })
        if (!delNode) {
            return Response.json({ message: "Fail to delete node"}, { status: 400 });
        }

        return Response.json({ message: `Succefully deleted node` }, { status: 200 });
    }
    catch (error) {
        return Response.json({ message: "Somthing wen't wrong on server"}, { status: 500 })
    }
    
} 