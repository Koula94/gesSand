import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        truck: {
          include: {
            driver: true,
          },
        },
        client: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching transactions" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const transaction = await prisma.transaction.create({
      data: {
        truckId: json.truckId,
        clientId: json.clientId,
        entryTime: new Date(),
        status: "PENDING",
      },
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
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating transaction" },
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
        { error: "Transaction ID is required" },
        { status: 400 }
      )
    }

    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting transaction" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split("/").pop()
    
    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      )
    }

    const json = await request.json()
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        exitTime: json.exitTime,
        sandWeight: json.sandWeight,
        totalWeight: json.totalWeight,
        status: json.status,
        payment: json.payment ? {
          create: {
            amount: json.payment.amount,
            method: json.payment.method,
            status: json.payment.status,
            bankReference: json.payment.bankReference,
          },
        } : undefined,
      },
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

    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating transaction" },
      { status: 500 }
    )
  }
}