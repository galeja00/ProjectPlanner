import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { prisma } from "@/db";
import { Team } from "@prisma/client";

enum Funcs {
    addMember = "addMember",
    removeMember = "removeMember",
    update = "update"
}
// TODO : Error on server status: 500, bad request: 400
// TODO : Refactor
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
        //TODO: chack if member is in project
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
        return Response.json({ error: "Error"}, {status: 500});
    }
}

export async function GET(req : Request, { params } : { params: { id: string, func : string } }) {
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
                id: params.id
            }
        })

        if (!team) {
            return Response.json({status : 400});
        }

        return Response.json({ team : team }, { status: 200 });
    }
    catch (error) {
        return Response.json({ status: 500 });
    }
} 