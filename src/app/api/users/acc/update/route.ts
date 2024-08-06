import { options } from "@/app/api/auth/[...nextauth]/options";
import { ErrorMessagges } from "@/error-messages";
import { authorize } from "@/app/api/static";
import { prisma } from "@/db";
import { Session } from "inspector";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";

export async function POST(req : Request) {
    try {   
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message:"Fail to authorize"}, { status: 401 });
        }
        const user = await prisma.user.findFirst({ where: { email : email }});
        if (!user) {
            return Response.json({ message: "Fail to authorize"}, { status: 401 });
        }
        const data = await req.json(); 
        const reqUser = data.user;

        if (!reqUser) {
            return Response.json({ message:"Bad request" }, {status: 400 });
        }
        
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                name: reqUser.name,
                surname: reqUser.surname,
            }
        })

        return Response.json({ message: "Succesfully updated user data" }, { status: 200 })
    }
    catch (error) {
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 });
    }
}