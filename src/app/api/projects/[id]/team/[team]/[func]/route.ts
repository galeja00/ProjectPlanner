import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { prisma } from "@/db";
import { Team } from "@prisma/client";
import { ErrorMessagges } from "@/app/api/error-messages";

// funcs with can handle this REST-APi endpoints
enum Funcs {
    addMember = "addMember",
    removeMember = "removeMember",
    update = "update"
}

// handle basic funcktions with team
export async function POST(req : Request, { params } : { params: { id: string, team : string, func : string } }) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }
        const data = await req.json();

        if (Funcs.update == params.func) {
            await prisma.team.update({
                where: {
                    id: params.team
                },
                data: {
                    name: data.name
                }
            })
            return Response.json({ message: "Update succed" }, {status: 200});
        }

        let teamId : string | null = null;
        if (Funcs.addMember == params.func) {
            teamId = data.teamId;
        }

        await prisma.projectMember.update({
            where: {
                id: data.memberId
            },
            data: {
                teamId: teamId
            }
        }) 

        return Response.json({status: 200});
    }
    catch (error) {
        console.error(error);
        return Response.json({ error: ErrorMessagges.Server}, { status: 500 });
    }
}

export async function GET(req : Request, { params } : { params: { id: string, team : string, func : string } }) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ error: "You are not member of this project"}, { status: 400 });
        }

        const team : Team | null = await prisma.team.findFirst({
            where: {
                id: params.team
            }
        })

        if (!team) {
            return Response.json({ error: "This team dont exist" }, {status : 400});
        }

        return Response.json({ team : team }, { status: 200 });
    }
    catch (error) {
        return Response.json({ error: ErrorMessagges.Server}, { status: 500 });
    }
} 