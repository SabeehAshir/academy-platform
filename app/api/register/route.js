// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    // 1. Grab the new fields from the incoming request
    const { name, email, phone, password } = await request.json();

    // 2. Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // 3. Create the user with the new details
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        phone: phone,
        password: password, // Note: In a production app, you would hash this!
      }
    });

    return NextResponse.json({ message: "Account created successfully", userId: newUser.id }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}