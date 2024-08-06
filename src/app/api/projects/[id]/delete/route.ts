import { authorize } from "@/app/api/static";
import { getMember } from "../static";
import { prisma } from "@/db";
import { ErrorMessagges } from "@/error-messages";

export async function POST(req : Request, { params } : { params: { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: ErrorMessagges.Authorize }, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ message: ErrorMessagges.MemberProject }, { status: 400 });
        }

        await prisma.project.delete({
            where: {
                id: params.id
            }
        });

        return Response.json({ status: 200 });
    }
    catch (error) {
        return Response.json({ message: ErrorMessagges.Server }, { status: 500 });
    }
}