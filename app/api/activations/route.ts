import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const activationData = await request.json()
    
    // Validate required fields
    if (!activationData.customerId || !activationData.simId || !activationData.planId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create transaction record
    const transaction = await mongoService.createTransaction({
      type: 'activation',
      customerId: activationData.customerId,
      simId: activationData.simId,
      amount: activationData.amount,
      operatorId: activationData.operatorId,
      status: 'completed',
      description: `Activation of SIM ${activationData.simId}`,
      metadata: {
        planId: activationData.planId,
        activationDate: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Update SIM status
    await mongoService.updateSim(activationData.simId, {
      status: 'active',
      customerId: activationData.customerId,
      planId: activationData.planId,
      activationDate: new Date(),
      updatedAt: new Date()
    })
    
    // Update customer's last activity
    await mongoService.updateCustomer(activationData.customerId, {
      lastActivity: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process activation' },
      { status: 500 }
    )
  }
}