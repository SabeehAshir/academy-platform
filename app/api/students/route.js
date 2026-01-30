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