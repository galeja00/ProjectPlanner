import { Session, getServerSession } from "next-auth";
import { options } from "./auth/[...nextauth]/options";
import { prisma } from "@/db";

// chack if user have session
export async function authorize(req : Request) : Promise<string | null> {
    try {
        const session : Session | null = await getServerSession(options);
        if (!(session && session.user)) {
            return null;
        }

        const email = session.user.email;
        
        if (!email) {
            return null;
        }

        return email;
    }
    catch (error) {
        return null
    }
    
}

// return user Id if user is existing in DB
export async function getUserId(email : string) : Promise<string | null> {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
            select: {
                id : true
            }
        })

        if (user == null) {
            return null;
        }

        return user.id;
    } catch (error) {
        console.error(error);
        return null;
    }
}