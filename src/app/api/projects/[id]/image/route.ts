import { authorize } from "@/app/api/static";
import { getMember } from "../static";
import { unlink } from "fs/promises";
import { prisma } from "@/db";

import sharp, { Sharp } from "sharp";
import { randomUUID } from "crypto";
import fs from 'fs';
import { Project } from "@prisma/client";
import { ErrorMessagges } from "@/error-messages";

// save submited image on server and save path to DB
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

        const project = await prisma.project.findFirst({
            where: {
                id: params.id
            }
        })
        if (!project) {
            return Response.json({ error: "This project dont exist" },{status: 400}); 
        }

        const formData = await req.formData();
        const image = formData.get("image");
        
        if (!image) {
            // If no file is received, return a JSON response with an error and a 400 status code
            return Response.json({ error: "No files received." }, { status: 400 });
        }
        if (image instanceof File) {
            const pathToImages = process.env.IMAGE_DIRECTORY_PATH;
            const file : File = image;
            if (!file || file.type != "image/png" && file.type != "image/jpeg") {
                return Response.json({ error: "This file isnt image" }, { status: 400 })
            }

            if (project.icon) {
                await unlink(`${pathToImages}project/${project.icon}`);
            }

            const fileData = await file.arrayBuffer();

            const imageBuffer : Buffer = Buffer.from(fileData);
            const imageSharp : Sharp = sharp(imageBuffer);

            const webpData = await imageSharp.webp().toBuffer();

            const name = randomUUID() + ".webp";
            const filePath = `${pathToImages}project/${name}`; 
            
            fs.writeFileSync(filePath, webpData);

            const upProject : Project = await prisma.project.update({
                where: {
                    id: project.id
                },
                data: {
                    icon: name
                }
            })

            return Response.json({ message: "Successful image uploud", icon: upProject.icon }, { status: 200 });
        }
        return Response.json({ error: ErrorMessagges.BadRequest }, {status: 400});

    }
    catch (error) {
        return Response.json({ error: ErrorMessagges.Server}, { status: 500 });
    }
}