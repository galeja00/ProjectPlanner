import { ErrorMessagges } from "@/error-messages";
import { authorize } from "@/app/api/static";
import { prisma } from "@/db";
import { hash } from "bcrypt";


// for change user password
export async function POST(req : Request) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const user = await prisma.user.findFirst({ where:  { email: email }});
        if (!user) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const data = await req.json(); 
        if(!data.password || !data.repeatPassword) {
            return Response.json({ error: "Passwords arent same"}, { status: 400}); 
        }

        const hashedPassword = await hash(data.password, 10);
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: hashedPassword
            }
        })
        return Response.json({ message: "Password change succesfully"}, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ error: ErrorMessagges.Server}, { status: 500 });
    }
}