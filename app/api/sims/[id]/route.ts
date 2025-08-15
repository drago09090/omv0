import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    
    const success = await mongoService.updateSim(params.id, {
      ...updateData,
      updatedAt: new Date()
    })
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'SIM not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'SIM updated successfully'
    })
  } catch (error) {
    console.error('Update sim error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update sim' },
      { status: 500 }
    )
  }
}