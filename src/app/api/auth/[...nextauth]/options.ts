import type { NextAuthOptions } from "next-auth"
//import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from '@/db'
import { compare } from 'bcrypt';
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailValidator from 'email-validator';
import NextAuth from "next-auth/next";


type User = {
    id: number;
    createdAt: Date;
    email: string;
    name: string;
    surname: string;
    password: string;
  };
  
// nextaouth hednling loggin and sesssion of user
export const options: NextAuthOptions = {
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/auth/signin',
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials, req)  {

                if (!(credentials?.email || credentials?.password)) {
                    return null;
                }

                credentials.email.toLocaleLowerCase();
                if(!EmailValidator.validate(credentials.email)) {
                    return null; 
                }
                
                const res = await prisma.user.findFirst({ where: { email: credentials.email } });
                
                if (res) {
                    const correctPsw = await compare(credentials.password || "", res.password);
                    
                    if (correctPsw) {
                        return { id: res.id, name: res.name, email: res.email };
                    }
                }

                return null;
            }
              
        })
    ],
    
}


  

