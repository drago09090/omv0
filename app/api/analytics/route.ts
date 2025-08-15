import { NextRequest, NextResponse } from 'next/server'
import { mongoAnalytics } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const activity = searchParams.get('activity')
    const days = parseInt(searchParams.get('days') || '7')
    
    if (userId) {
      const stats = await mongoAnalytics.getUserActivityStats(userId, days)
      return NextResponse.json({
        success: true,
        data: stats
      })
    }
    
    if (activity) {
      const metrics = await mongoAnalytics.getGlobalMetrics(activity, days)
      return NextResponse.json({
        success: true,
        data: metrics
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, activity, metadata } = await request.json()
    
    if (!userId || !activity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    await mongoAnalytics.trackActivity(userId, activity, metadata)
    
    return NextResponse.json({
      success: true,
      message: 'Activity tracked successfully'
    })
  } catch (error) {
    console.error('Track activity error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track activity' },
      { status: 500 }
    )
  }
}