// BlackRoad Copilot Gateway Integration
// Add to: /app/api/gateway/[...path]/route.ts

import { NextRequest, NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3030'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const searchParams = request.nextUrl.searchParams
  
  const gatewayUrl = `${GATEWAY_URL}/api/${path}?${searchParams}`
  
  try {
    const response = await fetch(gatewayUrl, {
      headers: {
        'X-Gateway-Client': request.headers.get('host') || 'unknown',
        'X-Gateway-Timestamp': new Date().toISOString()
      }
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'X-Gateway-Response': 'true',
        'X-Gateway-Version': '2.0.0'
      }
    })
  } catch (error) {
    console.error('Gateway error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Gateway unavailable',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const body = await request.json()
  
  const gatewayUrl = `${GATEWAY_URL}/api/${path}`
  
  try {
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Client': request.headers.get('host') || 'unknown'
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Gateway unavailable' },
      { status: 503 }
    )
  }
}
