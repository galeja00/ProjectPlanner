import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { authorize } from "../../static";



export async function GET(req : Request) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }


        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if(!user) {
            return NextResponse.json({ error: "Fail to authorize"}, { status: 401 });
        }

        return NextResponse.json({ message: "succes", user: user}, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: error }, { status: 500 })
    }
    
} 
