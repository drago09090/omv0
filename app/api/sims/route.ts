import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'
import { CacheService } from '@/lib/cache-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const operator = searchParams.get('operator')
    const warehouseId = searchParams.get('warehouseId')
    
    const filter: any = {}
    if (status) filter.status = status
    if (operator) filter.operator = operator
    if (warehouseId) filter.warehouseId = warehouseId
    
    const sims = await mongoService.getSims(filter)
    
    return NextResponse.json({
      success: true,
      data: sims
    })
  } catch (error) {
    console.error('Get sims error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sims' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const simData = await request.json()
    
    // Validate required fields
    if (!simData.iccid || !simData.msisdn || !simData.operator) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const sim = await mongoService.createSim({
      ...simData,
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      data: sim
    })
  } catch (error) {
    console.error('Create sim error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create sim' },
      { status: 500 }
    )
  }
}