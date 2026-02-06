// app/api/students/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    // 1. We now accept 'studentId' from the frontend
    const { name, age, parentId, studentId } = await request.json();

    if (!name || !parentId) {
      return NextResponse.json({ error: 'Missing name or parent ID' }, { status: 400 });
    }

    // 2. Prepare the data object
    const studentData = {
      name: name,
      age: parseInt(age),
      parentId: parentId,
    };

    // 3. ONLY add the ID if the parent typed one in
    if (studentId && studentId.trim() !== "") {
      studentData.id = studentId; 
    }

    // 4. Create the student
    const newStudent = await prisma.student.create({
      data: studentData,
    });

    return NextResponse.json(newStudent);

  } catch (error) {
    console.error("Error creating student:", error);
    
    // Check if the error is "Unique Constraint Violation" (ID already exists)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "That Student ID is already taken!" }, { status: 409 });
    }
    
    return NextResponse.json({ error: "Failed to add student" }, { status: 500 });
  }
}
// app/api/students/route.js

// ... (keep your existing POST function here) ...

// app/api/students/route.js

// ... keep imports and POST function ...

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    if (!parentId) {
      return NextResponse.json({ error: 'Parent ID is required' }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: { parentId: parentId },
      orderBy: { name: 'asc' },
      // NEW: Include the enrollments and the course details!
      include: {
        enrollments: {
          include: {
            course: true
          }
        }
      }
    });

    return NextResponse.json(students);

  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await prisma.student.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Student deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, name, age } = await request.json();

    const updatedStudent = await prisma.student.update({
      where: { id: id },
      data: { 
        name: name, 
        age: parseInt(age) 
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}