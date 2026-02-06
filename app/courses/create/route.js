// app/api/courses/create/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const data = await request.json();

    // Create the course in the database
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        minAge: data.minAge,
        maxAge: data.maxAge,
        category: data.category,
        zoomLink: data.zoomLink,
        price: 0 // Defaulting to free for now
      }
    });

    return NextResponse.json(course);

  } catch (error) {
    console.error("Failed to create course:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}