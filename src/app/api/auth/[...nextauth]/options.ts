import type { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from '@/db'
import { compare } from 'bcrypt';

type User = {
    id: number;
    createdAt: Date;
    email: string;
    name: string;
    surname: string;
    password: string;
  };
  

export const options: NextAuthOptions = {
    session: {
        strategy: 'jwt'
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials) {
                const users = await prisma.user.findMany({ where: { email: credentials?.email }});
                const user = users[0];
                console.log(user);
                var  correctPsw = null;
                if (user) {
                    correctPsw = await compare(credentials?.password || "", user.password);
                    if (correctPsw) {
                       return user as User;
                    }
                }

                return null;
              }
        })
    ],
    pages: {
        signIn: '/auth/signin',
    }
}