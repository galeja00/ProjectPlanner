import { authorize } from "@/app/api/static";
import { randomUUID } from "crypto";
import fs from 'fs';
import sharp, { Sharp } from 'sharp';
import { prisma } from "@/db";
import { User } from "@prisma/client";
import { unlink } from "fs/promises";
import { ErrorMessagges } from "@/error-messages";

export async function GET(req : Request) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: ErrorMessagges.Authorize}, { status: 401 });
        }
        const user : User | null = await prisma.user.findFirst({ where: { email: email }});    
        if (!user) {
            return Response.json({message: ErrorMessagges.Authorize}, { status: 400 });
        }
        return Response.json({ image: user.image }, { status: 200 });
    }
    catch (error) {
        return Response.json({ message: ErrorMessagges.Server}, { status: 400 });
    }
}
// for submiting new photo/image for user
export async function POST(req : Request) {
    try {
        const email = await authorize(req);
        if (!email) {
            return Response.json({ message: ErrorMessagges.Authorize}, { status: 401 });
        }
        const user : User | null = await prisma.user.findFirst({ where: { email: email }});    
        if (!user) {
            return Response.json({message: ErrorMessagges.Authorize}, { status: 400 });
        }
        const formData = await req.formData();
        const image = formData.get("image");
        
        if (!image) {
            // If no file is received, return a JSON response with an error and a 400 status code
            return Response.json({ message: "No files received." }, { status: 400 });
        }
        if (image instanceof File) {
            const pathToImages = process.env.IMAGE_DIRECTORY_PATH;
            const file : File = image;
            
            //chack if file is image type
            if (!file || file.type != "image/png" && file.type != "image/jpeg") {
                return Response.json({ message: "This file isnt image" }, { status: 400 })
            }
            //if user have image delete it
            if (user.image) {
                await unlink(`${pathToImages}user/${user.image}`);
            }

            // convert file to webp for smaller size
            const fileData = await file.arrayBuffer();
            const imageBuffer : Buffer = Buffer.from(fileData);
            const imageSharp : Sharp = sharp(imageBuffer);
            const webpData : Buffer = await imageSharp.webp().toBuffer();
            // change name of file and write
            const name = randomUUID() + ".webp";
            const filePath = `${pathToImages}user/${name}`; 
            fs.writeFileSync(filePath, webpData);

            const upUser: User = await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    image: name
                }
            })

            return Response.json({ message: "Successful image uploud", img: upUser.image }, { status: 200 });
        }
        return Response.json({status: 400});
    }
    catch (error) {
        console.error(error);
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 });
    }
}


