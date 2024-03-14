import { authorize } from "@/app/api/static";
import { prisma } from "@/db";

// TODO: kontrola emailu
export async function POST(req : Request) {
    try {   
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const user = await prisma.user.findFirst({ where: { email : email }});
        if (!user) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const data = await req.json(); 
        if (!data.user) {
            return Response.json({ error: "Bad request"}, {status: 400});
        }
        if (email !== data.email) {
            const CountSameEmails = await prisma.user.count({ where: { email: data.email}});
            if (CountSameEmails > 0) {
                return Response.json({ massage: "This email is allready used" }, { status: 400 });
            }
        }
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                name: user.name,
                surname: user.surname,
                email: user.email
            }
        })
    }
    catch (error) {
        return Response.json({ error: error }, { status: 400 })
    }
}