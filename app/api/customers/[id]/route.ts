import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'
import { CacheService } from '@/lib/cache-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try cache first
    const cachedCustomer = await CacheService.getCachedCustomer(params.id)
    if (cachedCustomer) {
      return NextResponse.json({
        success: true,
        data: cachedCustomer
      })
    }
    
    const customer = await mongoService.findOne('customers', { _id: params.id })
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    // Cache for future requests
    await CacheService.cacheCustomer(params.id, customer)
    
    return NextResponse.json({
      success: true,
      data: customer
    })
  } catch (error) {
    console.error('Get customer error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    
    const success = await mongoService.updateCustomer(params.id, {
      ...updateData,
      updatedAt: new Date()
    })
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    // Invalidate cache
    await CacheService.invalidateUserCache(params.id)
    
    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully'
    })
  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}