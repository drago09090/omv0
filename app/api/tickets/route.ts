import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const createdBy = searchParams.get('createdBy')
    const assignedTo = searchParams.get('assignedTo')
    
    const filter: any = {}
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (createdBy) filter.createdBy = createdBy
    if (assignedTo) filter.assignedTo = assignedTo
    
    const tickets = await mongoService.getTickets(filter, { sort: { createdAt: -1 } })
    
    return NextResponse.json({
      success: true,
      data: tickets
    })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ticketData = await request.json()
    
    // Validate required fields
    if (!ticketData.title || !ticketData.description || !ticketData.category || !ticketData.priority) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const ticket = await mongoService.createTicket({
      ...ticketData,
      status: 'open',
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      data: ticket
    })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}