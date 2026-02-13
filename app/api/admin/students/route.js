// app/api/admin/students/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: { 
        parent: true,
        enrollments: { include: { course: true } }
      }
    });
    
    return NextResponse.json(students);
    
  } catch (error) {
    console.error("Database error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}