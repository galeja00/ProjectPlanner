
import { ErrorMessagges } from "@/error-messages";
import { prisma } from "@/db";
import { randomInt } from 'crypto';
import { createEmailService } from "@/mail";


// for user to submit his email for reset password
export async function POST(req : Request) {
    try {
        const data = await req.json(); 
        
        const user = await prisma.user.findFirst({ where:  { email: data.email }});
        if (!user) {
            return Response.json({ message: "User not found"}, { status: 400 });
        }

        const token = randomInt(10000, 99999);
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: token.toString(),
                expiresAt: new Date(new Date().getTime() + 1000 * 60 * 5)
            }
        })

        const emailService = createEmailService();
        await emailService.sendEmail(user.email, "Reset your password", `Your password reset token is: ${token}.\n You have 5 minutes to reset your password`);
        return Response.json({ message: "Email sent", userId: user.id }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return Response.json({ message: ErrorMessagges.Server}, { status: 500 });
    }
}
