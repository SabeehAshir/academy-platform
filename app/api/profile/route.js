import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET the user's current profile
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "No User ID provided" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true } // Only grab what we need
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// UPDATE the user's profile
export async function PATCH(request) {
  try {
    const { userId, name, email } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: name } // If you want them to be able to change email, add email: email here
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}