import { NextRequest, NextResponse } from 'next/server'
import { mongoService } from '@/lib/mongodb'
import { CacheService } from '@/lib/cache-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    
    const filter: any = {}
    if (role) filter.role = role
    if (status) filter.isActive = status === 'active'
    
    const users = await mongoService.getUsers(filter)
    
    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Validate required fields
    if (!userData.name || !userData.email || !userData.role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const user = await mongoService.createUser({
      ...userData,
      isActive: true,
      permissions: userData.permissions || [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Cache the user
    await CacheService.cacheUser(user._id, user)
    
    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}