import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// --- GET: Fetch a parent's students ---
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    if (!parentId) return NextResponse.json({ error: "Missing parentId" }, { status: 400 });

    const students = await prisma.student.findMany({
      where: { parentId: parentId },
      include: {
        enrollments: {
          include: { course: true }
        }
      }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("GET Students Error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

// --- POST: Add a new student ---
export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, surname, age, email, jamat, city, schoolYear, studentId, parentId } = body;

    // We now check for firstName and surname instead of just 'name'
    if (!firstName || !surname || !parentId) {
      return NextResponse.json({ error: "Missing required fields (First Name, Surname, or Parent ID)" }, { status: 400 });
    }

    const newStudent = await prisma.student.create({
      data: {
        firstName: firstName,
        surname: surname,
        age: age ? parseInt(age) : null, // Convert string age from form to a Number
        email: email || null,
        jamat: jamat || null,
        city: city || null,
        schoolYear: schoolYear || null,
        studentId: studentId || null,
        parentId: parentId
      }
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("POST Student Error:", error);
    return NextResponse.json({ error: "Failed to add student" }, { status: 500 });
  }
}

// --- PATCH: Edit an existing student ---
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, firstName, surname, age, email, jamat, city, schoolYear, studentId } = body;

    if (!id) return NextResponse.json({ error: "Missing student ID" }, { status: 400 });

    const updatedStudent = await prisma.student.update({
      where: { id: id },
      data: {
        firstName: firstName,
        surname: surname,
        age: age ? parseInt(age) : null,
        email: email || null,
        jamat: jamat || null,
        city: city || null,
        schoolYear: schoolYear || null,
        studentId: studentId || null
      }
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("PATCH Student Error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// --- DELETE: Remove a student ---
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });

    // Delete enrollments first to avoid database relation errors
    await prisma.enrollment.deleteMany({
      where: { studentId: id }
    });

    await prisma.student.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Student deleted" });
  } catch (error) {
    console.error("DELETE Student Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}