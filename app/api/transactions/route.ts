import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'
import { CacheService } from '@/lib/cache-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const operatorId = searchParams.get('operatorId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    
    const filter: any = {}
    if (customerId) filter.customerId = customerId
    if (operatorId) filter.operatorId = operatorId
    if (status) filter.status = status
    if (type) filter.type = type
    
    const transactions = await mongoService.getTransactions(filter, { sort: { createdAt: -1 } })
    
    return NextResponse.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json()
    
    // Validate required fields
    if (!transactionData.type || !transactionData.customerId || !transactionData.amount || !transactionData.operatorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const transaction = await mongoService.createTransaction({
      ...transactionData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Invalidate related caches
    await CacheService.invalidateUserCache(transactionData.operatorId)
    
    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}