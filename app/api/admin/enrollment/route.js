
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request) {
  try {
    const { enrollmentId, status } = await request.json();

    // Validate input
    if (!enrollmentId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Update the database
    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: status }
    });

    return NextResponse.json({ message: "Success", updated });

  } catch (error) {
    console.error("Admin Update Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}