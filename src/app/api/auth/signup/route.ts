import { NextResponse } from "next/server";
import { hash } from 'bcrypt';
import { prisma } from '@/db'
import { ErrorMessagges } from "../../../../error-messages";

type UserInputs = {
    email : string,
    name : string,
    surname : string,
    password : string,
    repeatpassword: string  
}


// post for reggistrating new user to application
// can be upgredet by using a system for chacking email by sanding confirm email
export async function POST(request : Request) {
    try {
        const { email , name , surname, password, repeatpassword } : UserInputs = await request.json();
        if (!(email && name && surname && password && repeatpassword)) {
            return NextResponse.json({ massage: "You need to fill all inputs"} , { status: 400 })
        }

        if (password.length < 8) {
            return NextResponse.json({ message: "Your password is too short, it needs to be at least 8 characters long"}, { status: 400 });
        }

        if (name.length == 0 || surname.length == 0) {
            return NextResponse.json({ message: "You need to fill up your name and surname"}, { status: 400 });
        }

        if (password !== repeatpassword) {
            return NextResponse.json({ message: "Your passwords arent same"}, { status: 400 });
        }

        const lowEmail = email.toLowerCase();
        const CountSameEmails = await prisma.user.count({ where: { email: lowEmail }});
        if (CountSameEmails > 0) {
            return NextResponse.json({ message: "This email is allready used"}, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);
        const response = await prisma.user.create({data: { email: lowEmail, name: name, surname: surname, password: hashedPassword }});
        if (response) {
            return NextResponse.json({ message: "Succesfully registred"}, { status: 200 })
        } else {
           return NextResponse.json({ message: "Our server have some problems, try again later"}, { status: 400 });
        }
    }
    catch (e) {
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 });
    }
}