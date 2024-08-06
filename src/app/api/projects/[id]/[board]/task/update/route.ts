import { authorize } from "@/app/api/static";
import { getMember } from "../../../static";
import { ProjectMember, Task } from "@prisma/client";
import { prisma } from "@/db";
import { ErrorMessagges } from "@/error-messages";

// update propertys data of task
export async function POST(req : Request, { params } : { params : { id : string }}) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: "Fail to authorize"}, { status: 401 });
        }
        const member = await getMember(email, params.id);
        if (!member) {
            return Response.json({ message: "You are not member of this project"}, { status: 400 });
        }

        const { task } : { task : Task } = await req.json();
        if (task.name.length == 0) {
            return Response.json({ message: "Name of Task can't be empty" }, { status: 400});
        }
        if (typeof task.estimatedHours == "string") {
            task.estimatedHours = parseInt(task.estimatedHours);
            if (task.estimatedHours < 0) {
                return Response.json({ message: "Estimated hour need o be more the 0"}, { status: 400 }); 
            }
        }
        await prisma.task.update({
            where: {
                id: task.id
            },
            data: {
                name: task.name,
                type: task.type,
                estimatedHours: task.estimatedHours,
                complexity: task.complexity,
                priority: task.priority,
                description: task.description,
                teamId: task.teamId
            }
        })

        return Response.json({ message: "Succesfully updated task" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ message: ErrorMessagges.Server }, { status: 500 });
    }
}