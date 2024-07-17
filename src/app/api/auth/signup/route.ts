import { NextResponse } from "next/server";
import { hash } from 'bcrypt';
import { prisma } from '@/db'

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

        if (password !== repeatpassword) {
            return NextResponse.json({ massage: "Your passwords arent same"}, { status: 400 });
        }

        const lowEmail = email.toLowerCase();
        const CountSameEmails = await prisma.user.count({ where: { email: lowEmail }});
        if (CountSameEmails > 0) {
            return NextResponse.json({ massage: "This email is allready used"}, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);
        const response = await prisma.user.create({data: { email: lowEmail, name: name, surname: surname, password: hashedPassword }});
        if (response) {
            return NextResponse.json({ massage: "Succesfully registred"}, { status: 200 })
        } else {
           return NextResponse.json({ massage: "Our server have some problems, try again later"}, { status: 400 });
        }
    }
    catch (e) {
        console.error(e);
        return NextResponse.json({ massage: "Somthing went wrong"}, { status: 400 });
    }
}