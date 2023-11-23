import { Session, getServerSession } from "next-auth";
import { options } from "./auth/[...nextauth]/options";


export async function authorize(req : Request) : Promise<string | null> {
    try {
        const session : Session | null = await getServerSession(options);
        if (!(session && session.user)) {
            return null;
        }

        const email = session.user.email;
        
        if (!email) {
            return null;
        }

        return email;
    }
    catch (error) {
        return null
    }
    
}