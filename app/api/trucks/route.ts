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
    console.error("Error fetching trucks:", error)
    return NextResponse.json(
      { error: "Error fetching trucks" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { licensePlate, driverId, emptyWeight } = json

    // Validate required fields
    if (!licensePlate || licensePlate.trim() === '') {
      return NextResponse.json(
        { error: "License plate is required" },
        { status: 400 }
      )
    }

    if (!driverId) {
      return NextResponse.json(
        { error: "Driver is required" },
        { status: 400 }
      )
    }

    if (!emptyWeight || isNaN(parseFloat(emptyWeight))) {
      return NextResponse.json(
        { error: "Valid empty weight is required" },
        { status: 400 }
      )
    }

    const truck = await prisma.truck.create({
      data: {
        licensePlate: licensePlate.trim(),
        driverId,
        emptyWeight: parseFloat(emptyWeight),
      },
      include: {
        driver: true,
      },
    })

    return NextResponse.json(truck)
  } catch (error) {
    console.error("Error creating truck:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error creating truck: ${error.message}` },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the truck" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split("/").pop()
    
    if (!id) {
      return NextResponse.json(
        { error: "Truck ID is required" },
        { status: 400 }
      )
    }

    await prisma.truck.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting truck" },
      { status: 500 }
    )
  }
}