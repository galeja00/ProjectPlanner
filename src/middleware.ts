import { getServerSession, User } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authorize } from './app/api/static';

// middleware.ts

export async function middleware(request: NextRequest) {

}

