import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        trucks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(drivers)
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching drivers" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const driver = await prisma.driver.create({
      data: {
        name: json.name,
        phone: json.phone,
      },
      include: {
        trucks: true,
      },
    })
    return NextResponse.json(driver)
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating driver" },
      { status: 500 }
    )
  }
}