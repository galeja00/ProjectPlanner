import { prisma } from "@/db";
import { ErrorMessagges } from "@/error-messages";

export async function POST(req : Request) {
    try {
        const data = await req.json(); 
        
        const passReset = await prisma.passwordReset.findFirst({ 
            where: {
                userId: data.userId,
                token: data.token,
                expiresAt: { gt: new Date() }
            }
        })
    
        if (!passReset) {
            return Response.json({ message: "Token not found"}, { status: 400 });
        }

        return Response.json({ message: "Token found"}, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 });
    }
}
