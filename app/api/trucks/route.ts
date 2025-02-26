import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const trucks = await prisma.truck.findMany({
      include: {
        driver: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(trucks)
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching trucks" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const truck = await prisma.truck.create({
      data: {
        licensePlate: json.licensePlate,
        driverId: json.driverId,
        emptyWeight: parseFloat(json.emptyWeight),
      },
      include: {
        driver: true,
      },
    })
    return NextResponse.json(truck)
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating truck" },
      { status: 500 }
    )
  }
}