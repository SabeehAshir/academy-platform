// app/api/enroll/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { studentId, courseId } = await request.json();

    if (!studentId || !courseId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: studentId,
        courseId: courseId,
      },
    });

    return NextResponse.json({ message: "Enrolled successfully", enrollment });

  } catch (error) {
    // P2002 is the error code for "Unique Constraint Failed" (Already enrolled)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Student is already in this class!" }, { status: 409 });
    }
    return NextResponse.json({ error: "Enrollment failed" }, { status: 500 });
  }
}