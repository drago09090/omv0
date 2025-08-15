import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const transferData = await request.json()
    
    // Validate required fields
    if (!transferData.fromUserId || !transferData.toUserId || !transferData.amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const amount = parseFloat(transferData.amount)
    
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }
    
    // Create transfer transaction for sender
    const senderTransaction = await mongoService.createTransaction({
      type: 'transfer',
      customerId: transferData.fromUserId,
      amount: -amount,
      operatorId: transferData.fromUserId,
      status: 'completed',
      description: `Transfer to ${transferData.toUserId}`,
      reference: transferData.reference,
      metadata: {
        transferType: 'outgoing',
        recipientId: transferData.toUserId,
        notes: transferData.notes
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Create transfer transaction for recipient
    const recipientTransaction = await mongoService.createTransaction({
      type: 'transfer',
      customerId: transferData.toUserId,
      amount: amount,
      operatorId: transferData.fromUserId,
      status: 'completed',
      description: `Transfer from ${transferData.fromUserId}`,
      reference: transferData.reference,
      metadata: {
        transferType: 'incoming',
        senderId: transferData.fromUserId,
        notes: transferData.notes
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      data: {
        senderTransaction,
        recipientTransaction
      }
    })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process transfer' },
      { status: 500 }
    )
  }
}