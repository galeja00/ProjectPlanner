import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { prisma } from "@/db";
import { authorize } from "../../static";
import fs from "fs"
import { ErrorMessagges } from "@/error-messages";

// return data about user
export async function GET(req : Request) {
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

        return Response.json({ user: user }, { status: 200 });
    }
    catch (error) {
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 })
    }
    
} 
