// app/api/courses/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this path matches where your prisma client is

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        title: 'asc' // Sorts courses alphabetically (A-Z)
      }
    });
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}