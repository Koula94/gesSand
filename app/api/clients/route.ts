import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Error fetching clients" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { name, company, phone, email } = json

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Valid name is required" },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate phone format if provided
    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone format" },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        company: company?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error creating client:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error creating client: ${error.message}` },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the client" },
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
        { error: "Client ID is required" },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting client" },
      { status: 500 }
    )
  }
}