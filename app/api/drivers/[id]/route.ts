import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const driver = await prisma.driver.findUnique({
      where: {
        id: params.id,
      },
      include: {
        trucks: true,
      },
    })
    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(driver)
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching driver" },
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
    const driver = await prisma.driver.update({
      where: {
        id: params.id,
      },
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
      { error: "Error updating driver" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.driver.delete({
      where: {
        id: params.id,
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting driver" },
      { status: 500 }
    )
  }
}