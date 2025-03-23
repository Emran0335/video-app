import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient.js";

export async function POST(request: Request) {
  try {
    const { username, fullName, email, password } = await request.json();

    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        password,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "An error occured" }, { status: 500 });
  }
}
