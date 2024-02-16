import { prisma } from "@/db";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";

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

// TODO: posible of differen types of search now only for for ID
export async function POST(req : Request) {
    try {
       // console.log(req);
        const session = await getServerSession(options);
        if (!(session && session.user)) {
            return Response.json({ error: "You cant get this data if you arent authorize"}, { status: 401 });
        }
        const email = session.user.email; 
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }

        const data = await req.json();

        const searchId : string = data.value;
        const users : UserInfo[] = await prisma.user.findMany({
            where: {
                id: {
                    contains: searchId 
                }
            },
            select: {
                id : true,
                name: true,
                surname: true,
                image: true
            }
        })
        console.log(users);
        return Response.json({ users: users }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ satus: 400 });
    }
}