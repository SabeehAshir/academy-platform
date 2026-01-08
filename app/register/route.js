import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, password } = await req.json();
  const user = await prisma.user.create({
    data: { email, password, role: "PARENT" }
  });
  return NextResponse.json(user);
}