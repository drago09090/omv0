import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    
    const filter: any = {}
    if (type) filter.type = type
    if (status) filter.status = status
    
    const plans = await mongoService.findMany('plans', filter)
    
    return NextResponse.json({
      success: true,
      data: plans
    })
  } catch (error) {
    console.error('Get plans error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const planData = await request.json()
    
    // Validate required fields
    if (!planData.name || !planData.type || !planData.baseCost || !planData.retailPrice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const plan = await mongoService.insertOne('plans', {
      ...planData,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      data: plan
    })
  } catch (error) {
    console.error('Create plan error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create plan' },
      { status: 500 }
    )
  }
}