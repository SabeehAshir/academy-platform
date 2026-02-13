import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, minAge, maxAge, category, zoomLink } = body;

    // 1. Make sure we at least have a title
    if (!title) {
      return NextResponse.json({ error: "Course title is required" }, { status: 400 });
    }

    // 2. Tell the database to create the new course
    const newCourse = await prisma.course.create({
      data: {
        title: title,
        description: description || "",
        minAge: minAge ? parseInt(minAge) : 5,    // Convert to number, default 5
        maxAge: maxAge ? parseInt(maxAge) : 18,   // Convert to number, default 18
        category: category || "General",
        zoomLink: zoomLink || null,
      }
    });

    // 3. Return success!
    return NextResponse.json(newCourse, { status: 201 });

  } catch (error) {
    console.error("Create Course Error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}