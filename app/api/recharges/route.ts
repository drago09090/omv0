import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const rechargeData = await request.json()
    
    // Validate required fields
    if (!rechargeData.customerId || !rechargeData.amount || !rechargeData.operatorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create transaction record
    const transaction = await mongoService.createTransaction({
      type: 'recharge',
      customerId: rechargeData.customerId,
      amount: rechargeData.amount,
      operatorId: rechargeData.operatorId,
      status: 'completed',
      description: `Recharge for customer ${rechargeData.customerId}`,
      metadata: {
        rechargeType: rechargeData.rechargeType || 'balance',
        rechargeDate: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Update customer's total spent and last activity
    const customer = await mongoService.findOne('customers', { _id: rechargeData.customerId })
    if (customer) {
      await mongoService.updateCustomer(rechargeData.customerId, {
        totalSpent: (customer.totalSpent || 0) + rechargeData.amount,
        lastActivity: new Date(),
        updatedAt: new Date()
      })
    }
    
    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('Recharge error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process recharge' },
      { status: 500 }
    )
  }
}