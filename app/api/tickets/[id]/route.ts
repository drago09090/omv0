import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    
    const success = await mongoService.updateTicket(params.id, {
      ...updateData,
      updatedAt: new Date()
    })
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully'
    })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}