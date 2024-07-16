import { Task } from "@prisma/client";



export type NodeInfo = {
    id: string,
    name: string,
    text: string,
    task?: Task | null,
    createdAgo: number,
}