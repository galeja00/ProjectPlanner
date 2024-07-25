import { ErrorMessagges } from "@/error-messages";
import { authorize } from "@/app/api/static";
import { prisma } from "@/db";

// delete user from Database
export async function POST(req : Request) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const user = await prisma.user.delete({
            where: {
                email: email
            }
        })
        if(!user) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }

        return Response.json({ mess: "Succesfully deleted profile" }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: ErrorMessagges.Server}, { status: 500 })
    }
    
} 