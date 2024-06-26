import { authorize } from "@/app/api/static";
import { getMember } from "../static";
import { prisma } from "@/db";

export async function POST(req : Request, { params } : { params: { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        await prisma.project.delete({
            where: {
                id: params.id
            }
        });

        return Response.json({ message: ""}, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: "Something went wron on server" }, { status: 500 });
    }
}