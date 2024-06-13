import { Project, Ranking } from "@prisma/client";

export type IssueInfo = {
    id : string,
    name : string,
    description: string,
    createAt : Date,
    priority : Ranking,
    userId : string,
    userImg : string,
    userName : string,
    project : Project,
}
