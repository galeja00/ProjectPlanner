import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { prisma } from "@/db";



export async function GET(req : Request, { params } : { params : { id : string }}) {
    try {
        const session = await getServerSession(options);

        if (!(session && session.user)) {
            return Response.json({ error: "You cant get this data if you arent authorize"}, { status: 401 });
        }

        const email = session.user.email;
            
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }


        const user = await prisma.user.findFirst({
            where: {
                id: params.id
            }
        })

        if(!user) {
            return Response.json({ error: "Can not find this user in DB"}, { status: 401 });
        }

        return Response.json({ message: "succes", user: user}, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: error }, { status: 500 })
    }
    
} 