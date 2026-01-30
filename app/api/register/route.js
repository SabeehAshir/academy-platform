import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
// Note: In a real app, you'd use 'bcryptjs' to hash the password here
// For now, let's get the logic working first!

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 1. Check if the parent already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // 2. Create the Parent User
    const user = await prisma.user.create({
      data: {
        email,
        password, // Reminder: Hash this later!
        role: "PARENT",
      },
    });

    return NextResponse.json(
      { message: "Parent account created!", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong during registration." },
      { status: 500 }
    );
  }
}