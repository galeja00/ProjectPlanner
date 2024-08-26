import { ErrorMessagges } from "@/error-messages";
import { authorize } from "@/app/api/static";
import { prisma } from "@/db";
import { hash } from "bcrypt";


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
            return Response.json({ message: "Token not found or expired"}, { status: 400 });
        }

        if(!data.password || !data.repeatPassword) {
            return Response.json({ message: "You need to submit both passwords"}, { status: 400 }); 
        }

        if (data.password.length < 8) {
            return Response.json({ message: "Your new password is too short; it needs to be at least 8 characters." }, { status: 400 });
        }

        if(data.password !== data.repeatPassword) {
            return Response.json({ message: "Passwords arent same"}, { status: 400}); 
        }
    
        const hashedPassword = await hash(data.password, 10);
        await prisma.user.update({
            where: {
                id: passReset.userId
            },
            data: {
                password: hashedPassword
            }
        })
        return Response.json({ message: "Password reset was succesfully"}, { status: 200 });

    }
    catch (error) {
        console.error(error);
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 });
    }
}

