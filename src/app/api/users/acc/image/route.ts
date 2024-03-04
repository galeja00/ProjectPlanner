import { authorize } from "@/app/api/static";
import { randomUUID } from "crypto";
import { Result } from "postcss";
import { writeFileSync } from 'fs';

export async function POST(req : Request) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ error: "Fail to authorize"}, { status: 401 });
        }

        const { file } : { file : File }= await req.json();
        if (file.type != "image/png" && file.type != "image/jpeg") {
            
            return Response.json({ error: "This file isnt image" }, { status: 400 })
        }
        if (!chackFileSize(file)) {
            return Response.json({ error: "File mus be smaller the 4MB" }, { status: 400 });
        }
        const newName = randomUUID();
       
    }
    catch (error) {

    }
}

function chackFileSize(file : File) : boolean {
    return file.size > 4 * 1024 * 1024;
}