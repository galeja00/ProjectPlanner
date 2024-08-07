import { prisma } from "@/db";
import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { ErrorMessagges } from "@/error-messages";

// update on protperty value of group
export async function POST(req : Request, { params } : { params: { id: string, board: string} } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: ErrorMessagges.Authorize }, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: ErrorMessagges.MemberProject}, { status: 400 });
        }

        const { id, newVal ,key }  = await req.json();

        if (key != "name") {
            return Response.json({ error: "You cant update this key in Group"}, { status: 200 }); 
        }

        await prisma.tasksGroup.update({
            where: {
                id: id
            },
            data: {
                [key]: newVal
            }
        })
        
        return Response.json({ message: "Sucesfully updated group"  }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ message: ErrorMessagges.Server }, { status: 500 });
    }
}