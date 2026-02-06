// app/api/admin/pending/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all enrollments where status is PENDING
    // Also include Student name and Course title so we know who/what it is
    const pendingList = await prisma.enrollment.findMany({
      where: { status: 'PENDING' },
      include: {
        student: true,
        course: true,     
        // Optional: Include parent email if you want to contact them
        student: {
           include: { parent: true }
        }
      },
      orderBy: { joinedAt: 'asc' } // Oldest requests first
    });

    return NextResponse.json(pendingList);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pending list" }, { status: 500 });
  }
}