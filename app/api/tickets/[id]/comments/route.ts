import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { message, author } = await request.json()
    
    if (!message || !author) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get current ticket
    const ticket = await mongoService.findOne('tickets', { _id: params.id })
    
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }
    
    const newComment = {
      id: Date.now(),
      author,
      message,
      timestamp: new Date()
    }
    
    const success = await mongoService.updateTicket(params.id, {
      comments: [...(ticket.comments || []), newComment],
      updatedAt: new Date()
    })
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to add comment' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: newComment
    })
  } catch (error) {
    console.error('Add comment error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}