import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const warehouseId = searchParams.get('warehouseId')
    
    if (warehouseId) {
      const inventory = await mongoService.getWarehouseInventory(warehouseId)
      return NextResponse.json({
        success: true,
        data: inventory
      })
    }
    
    // Get all warehouses
    const warehouses = await mongoService.findMany('warehouses')
    
    return NextResponse.json({
      success: true,
      data: warehouses
    })
  } catch (error) {
    console.error('Get warehouse error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch warehouse data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const warehouseData = await request.json()
    
    const warehouse = await mongoService.insertOne('warehouses', {
      ...warehouseData,
      totalSims: 0,
      availableSims: 0,
      assignedSims: 0,
      reservedSims: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      data: warehouse
    })
  } catch (error) {
    console.error('Create warehouse error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create warehouse' },
      { status: 500 }
    )
  }
}