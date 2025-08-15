import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'
import { CacheService } from '@/lib/cache-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const createdBy = searchParams.get('createdBy')
    
    const filter: any = {}
    if (status) filter.status = status
    if (createdBy) filter.createdBy = createdBy
    
    const customers = await mongoService.getCustomers(filter)
    
    return NextResponse.json({
      success: true,
      data: customers
    })
  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json()
    
    // Validate required fields
    if (!customerData.name || !customerData.email || !customerData.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const customer = await mongoService.createCustomer({
      ...customerData,
      status: 'active',
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Cache the customer
    await CacheService.cacheCustomer(customer._id, customer)
    
    return NextResponse.json({
      success: true,
      data: customer
    })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}