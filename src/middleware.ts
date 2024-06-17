import { getServerSession, User } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

//TODO: authmidleware
export async function middleware(req: NextRequest) {

}
  
