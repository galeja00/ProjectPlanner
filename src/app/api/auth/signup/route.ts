import { NextResponse } from "next/server";
import { hash } from 'bcrypt';
import { prisma } from '@/db'


export async function POST(request : Request) {
    try {
        const { email, name, surname, password } = await request.json();
        //const x = request.json()
        // validate
        console.log({ email, name, surname, password });

        const hashedPassword = await hash(password, 10);

        const response = await prisma.user.create({data: { email: email, name: name, surname: surname, password: hashedPassword}});

        if (response) {
            return NextResponse.json({ massage: "success"})
        } else {
            return NextResponse.json({ massage: "fail"});
        }
    }
    catch (e) {
        console.log({ e });
        return NextResponse.json({ massage: "fail"});
    }
}