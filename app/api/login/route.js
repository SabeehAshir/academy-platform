// app/api/login/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this path matches your prisma setup

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // 2. Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // 3. Check if password matches (Direct comparison for now)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // 4. Success! (In a real app, we would set a session cookie here)
    // For now, we just return the user info (excluding the password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      message: "Login successful", 
      user: userWithoutPassword 
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}