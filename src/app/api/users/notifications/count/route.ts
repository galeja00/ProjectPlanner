import { ProjectInvite } from "@prisma/client";
import { authorize, getUserId } from "../../../static";
import { prisma } from "@/db";
import { DateTime } from "next-auth/providers/kakao";


export async function GET(req : Request, { params } : { params : { id : string }}) {
    try {
        const email : string | null = await authorize(req);
        if (email == null) {
            return Response.json({ rror: "Fail to authorize" }, { status: 400 });
        }
        const id : string | null = await getUserId(email);
        if (id == null) {
            return Response.json({ error: ""}, { status: 400 });
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
        return Response.json({ error: "" }, { status: 400 });
    }
}