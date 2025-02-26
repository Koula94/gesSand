import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { transactionId } = json

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        truck: {
          include: {
            driver: true,
          },
        },
        client: true,
        payment: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    if (!transaction.client.email) {
      return NextResponse.json(
        { error: "Client email not found" },
        { status: 400 }
      )
    }

    // Here you would implement your email sending logic
    // For example, using a service like SendGrid, Mailgun, etc.
    console.log("Sending receipt to:", transaction.client.email)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending receipt:", error)
    return NextResponse.json(
      { error: "Error sending receipt" },
      { status: 500 }
    )
  }
}