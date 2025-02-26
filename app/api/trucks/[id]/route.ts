import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const truck = await prisma.truck.findUnique({
      where: {
        id: params.id,
      },
      include: {
        driver: true,
      },
    })
    if (!truck) {
      return NextResponse.json(
        { error: "Truck not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(truck)
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching truck" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const truck = await prisma.truck.update({
      where: {
        id: params.id,
      },
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
      { error: "Error updating truck" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.truck.delete({
      where: {
        id: params.id,
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting truck" },
      { status: 500 }
    )
  }
}