import { authorize } from "@/app/api/static";
import { ErrorMessagges } from "@/error-messages";
import { getMember } from "../../../static";
import { prisma } from "@/db";
import { TaskColumn } from "@prisma/client";

// create new column on Board to insert tasks
export async function POST(req : Request, { params } : { params: { id: string, board: string } } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: ErrorMessagges.Authorize }, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ message: ErrorMessagges.MemberProject}, { status: 400 });
        }

        const { id } = await req.json();


        await prisma.taskColumn.delete({
            where: {
                id: id
            }
        })
     
        return Response.json({ message: "Collumn succesfully deleted" }, { status: 200 })
    
    }
    catch (error) {
        console.log(error);
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 });
    }
}