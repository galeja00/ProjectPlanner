import { prisma } from "@/db";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { ErrorMessagges } from "../../../../error-messages";

enum SearchTypes {
    Id = "id",
    Name = "name"
}

type UserInfo = {
    id : string,
    name : string,
    surname : string,
    image : string | null
}

// will return searched user for invite to project by name or id
export async function POST(req : Request) {
    try {
        const session = await getServerSession(options);
        if (!(session && session.user)) {
            return Response.json({ message: "You cant get this data if you arent authorize"}, { status: 401 });
        }
        const email = session.user.email; 
        if (!email) {
            return Response.json({ message: "Fail to authorize"}, { status: 401 });
        }

        const data = await req.json();

        const search : string = data.value;
        

        let users : UserInfo[]  = [];
        // chack type of search
        if (SearchTypes.Name == data.type) {
            const names : string[] = search.split(" ");
            let orConditions: any[] = names.flatMap(name => [
                { name: { contains: name, mode: 'insensitive' } },
                { surname: { contains: name, mode: 'insensitive' } }
            ]);;

            users = await prisma.user.findMany({
                where: {
                    OR: orConditions
                },
                select: {
                    id : true,
                    name: true,
                    surname: true,
                    image: true
                }
            });
        } else {
            users = await prisma.user.findMany({
                where: {
                    id: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                select: {
                    id : true,
                    name: true,
                    surname: true,
                    image: true
                }
            })
        }

        if (data.projectId) {
            const members = await prisma.projectMember.findMany({
                where: {
                    projectId: data.projectId
                }
            })

            const invites = await prisma.projectInvite.findMany({
                where: {
                    projectId: data.projectId
                }
            })
            const memberIds = new Set(members.map(member => member.userId));
            const inviteIds = new Set(invites.map(invite => invite.invitedUserId));

            users = users.filter(user => !memberIds.has(user.id) && !inviteIds.has(user.id));
        }
        

        return Response.json({ users: users }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ message: ErrorMessagges.Server}, { status: 400 });
    }
}