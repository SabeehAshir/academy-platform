import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });

    // 1. Delete their enrollments first (to bypass the database lock)
    await prisma.enrollment.deleteMany({
      where: { studentId: id }
    });

    // 2. Now it is safe to delete the student
    await prisma.student.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Student deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}