import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { prisma } from "@/db";
import { NextResponse } from "next/server";



export async function GET(req : Request) {
    try {
        const session = await getServerSession(options);

        if (!(session && session.user)) {
            return NextResponse.json({ error: "You cant get this data if you arent authorize"}, { status: 401 });
        }

        const email = session.user.email;
            
        if (!email) {
            return NextResponse.json({ error: "Fail to authorize"}, { status: 401 });
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
