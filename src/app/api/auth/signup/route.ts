import { NextResponse } from "next/server";
import { hash } from 'bcrypt';
import { prisma } from '@/db'


export async function POST(request : Request) {
    // TODO: validaci emailu a potvrzení emailove adresy... (nodemailer...)
    try {
        const { email , name , surname, password, repeatpassword } = await request.json();
        if (!(email && name && surname && password && repeatpassword)) {
            return NextResponse.json({ massage: "You need to fill all inputs"} , { status: 400 })
        }

        if (password !== repeatpassword) {
            return NextResponse.json({ massage: "Your passwords arent same"}, { status: 400 });
        }
        // TODO: validace vstupu od uzivatele (csrfToken, callbackUrl)
        const CountSameEmails = await prisma.user.count({ where: { email: email}});
        if (CountSameEmails > 0) {
            return NextResponse.json({ massage: "This email is allready used"}, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);
        const response = await prisma.user.create({data: { email: email, name: name, surname: surname, password: hashedPassword }});
        if (response) {
            return NextResponse.json({ massage: "succes"}, { status: 200 })
        } else {
           return NextResponse.json({ massage: "Our server have some problems, try again later"}, { status: 400 });
        }
    }
    catch (e) {
        console.error({ e });
        return NextResponse.json({ massage: "fail"}, { status: 400 });
    }
}