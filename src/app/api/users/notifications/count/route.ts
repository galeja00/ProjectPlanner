
import { authorize, getUserId } from "../../../static";
import { prisma } from "@/db";
import { ErrorMessagges } from "@/app/api/error-messages";


export async function GET(req : Request, { params } : { params : { id : string }}) {
    try {
        const email : string | null = await authorize(req);
        if (email == null) {
            return Response.json({ error: ErrorMessagges.Authorize }, { status: 400 });
        }
        const id : string | null = await getUserId(email);
        if (id == null) {
            return Response.json({ error: ErrorMessagges.Authorize }, { status: 400 });
        }
        
        let count : number = 0;
        const numberOfProjInv : number = await prisma.projectInvite.count({
            where: {
                invitedUserId: id,
                displayed: false
            }
        })

        count += numberOfProjInv;
    
        return Response.json({ count: count }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: ErrorMessagges.Server}, { status: 500 });
    }
}