import { prisma } from "@/db";
import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { group } from "console";
import { ErrorMessagges } from "@/error-messages";

type Range = {
    start : number,
    end : number,
}

// move index of group
export async function POST(req : Request, { params } : { params: { id: string, board: string} } ) {
    try {
        
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: ErrorMessagges.Authorize }, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ message: ErrorMessagges.MemberProject }, { status: 400 });
        }

        const { id, newVal } : { id : string, newVal : number }= await req.json();
         
        
        if (newVal < 0) {
            return Response.json({ message: "Cant move to possition to neggative numbers"}, { status: 400 });
        }
        const backlog = await prisma.backlog.findFirst({
            where: {
                projectId: params.id
            }
        })

        if (!backlog) {
            return Response.json({ message: "This Time Table don't exist."}, { status: 400 });
        }

        const groups = await prisma.tasksGroup.findMany({
            where: {
                backlogId: backlog.id
            }
        })

        if (groups.length < newVal) {
            return Response.json({ message: "Cant move out of indexis"}, { status: 400 });
        }

        let prevG = groups.find((g) => g.id == id);
        if (prevG == undefined) {
            return Response.json({ message: "This Group don't exist."}, { status: 400 });
        }
        
        let mov = newVal > prevG.position ? -1 : 1;
        
        let searchRange = createRange(newVal, prevG.position);

        const moveGroups = groups
            .filter(g => isBetweenRangeInclude(searchRange, g.position) && prevG && g.id !== prevG.id)
            .map(g => ({
                ...g,
                position: g.position + mov
            }));
        moveGroups.push({ ...prevG, position: newVal});


        await prisma.$transaction(
            moveGroups.map((g) => prisma.tasksGroup.update({
                where: {
                    id: g.id
                },
                data: {
                    position: g.position
                }
            }))
        );
        return Response.json({ message: "Sucesfully moved group" }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ message: ErrorMessagges.Server }, { status: 500 });
    }
}


function createRange(a : number, b : number) : Range {
    return { start: Math.min(a, b), end: Math.max(a, b)  };
}

function isBetweenRangeInclude(range : Range, val : number) : boolean {
    return range.start <= val && range.end >= val;
}