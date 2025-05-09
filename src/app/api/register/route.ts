// app/api/register/route.ts
import { NextResponse,NextRequest } from 'next/server';
import { authMiddleware } from '@/middlewares/authMiddleware';
import prisma from '@/lib/prismaClient';
import upload from '@/middlewares/multer';

export async function POST(request: Request) {
  const {username, fullName, password} = await request.json()
  // First authenticate the request
  const authResponse = await authMiddleware(request as unknown as NextRequest);
  
  if (authResponse instanceof Response) {
    // If authMiddleware returned a Response, it means there was an error
    return authResponse;
  }

  // If we get here, auth was successful and we have the user
  const user = authResponse;

  try {
    // Your registration logic here
    // For example, create a new user or update existing one
    const newUser = await prisma.user.create({
      data: {
        username: username,
        fullName: fullName,
        password: password,
        coverImage: upload.fields(['image']),
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Registration failed'},
      { status: 500 }
    );
  }
}