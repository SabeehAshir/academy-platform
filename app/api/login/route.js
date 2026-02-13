// app/api/login/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });

    // Note: In a production app, use bcrypt to compare hashed passwords!
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // NEW: We are explicitly sending the ROLE back to the frontend
    return NextResponse.json({ 
      message: "Login successful", 
      userId: user.id,
      role: user.role 
    }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}