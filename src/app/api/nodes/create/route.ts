
import { prisma } from "@/db";
import { authorize } from "../../static";
import { ErrorMessagges } from "@/error-messages";

// create new node
export async function POST(req : Request) {
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

        const { header, desc, taskId } = await req.json();
        
        const node = await prisma.node.create({
            data: {
                name: header,
                text: desc,
                userId: user.id,
                taskId: taskId ?? null
            }
        })
        

        return Response.json({ message: "Succefully created note", id: node.id }, { status: 200 });
    }
    catch (error) {
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 })
    }
    
} 