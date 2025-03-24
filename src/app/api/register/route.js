import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient.js";
import { upload } from "@/middlewares/multer.js";

const imageFile = upload.fields([
  {
    name: "avatar",
    maxCount: 1,
  },
  {
    name: "coverImage",
    maxCount: 1,
  },
]);

export async function POST(imageFile, request) {
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
