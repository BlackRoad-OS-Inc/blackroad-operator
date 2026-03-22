#!/bin/bash
# Add gateway integration to all Next.js services

echo "🔌 Adding gateway integration to all services..."
echo ""

SERVICES="web api brand console core demo docs operator prism"

for SERVICE in $SERVICES; do
  SERVICE_DIR=~/services/$SERVICE
  
  if [ ! -d "$SERVICE_DIR" ]; then
    echo "⏭️  Skipping $SERVICE (not found)"
    continue
  fi
  
  echo "📦 Processing $SERVICE..."
  
  # Create API gateway route
  mkdir -p "$SERVICE_DIR/app/api/gateway/[[...path]]"
  
  cat > "$SERVICE_DIR/app/api/gateway/[[...path]]/route.ts" << 'ROUTE'
// BlackRoad Copilot Gateway Integration
import { NextRequest, NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3030'

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  const path = params.path?.join('/') || ''
  const searchParams = request.nextUrl.searchParams
  
  const gatewayUrl = `${GATEWAY_URL}/api/${path}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
  
  try {
    const response = await fetch(gatewayUrl, {
      headers: {
        'X-Gateway-Client': request.headers.get('host') || 'unknown',
        'X-Gateway-Service': process.env.SERVICE_NAME || 'unknown'
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
    return NextResponse.json(
      { 
        success: false,
        error: 'Gateway unavailable',
        gateway: GATEWAY_URL
      },
      { status: 503 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  const path = params.path?.join('/') || ''
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
      { success: false, error: 'Gateway unavailable' },
      { status: 503 }
    )
  }
}
ROUTE
  
  # Add to .env.example if not exists
  if [ -f "$SERVICE_DIR/.env.example" ]; then
    if ! grep -q "GATEWAY_URL" "$SERVICE_DIR/.env.example"; then
      echo "" >> "$SERVICE_DIR/.env.example"
      echo "# BlackRoad Copilot Gateway" >> "$SERVICE_DIR/.env.example"
      echo "GATEWAY_URL=http://localhost:3030" >> "$SERVICE_DIR/.env.example"
    fi
  fi
  
  echo "  ✅ Added gateway route to $SERVICE"
done

echo ""
echo "🎉 Gateway integration complete!"
echo ""
echo "📝 What was added to each service:"
echo "  • /app/api/gateway/[[...path]]/route.ts - Gateway proxy route"
echo "  • GATEWAY_URL in .env.example"
echo ""
echo "🧪 Test endpoints (after starting services):"
echo "  http://localhost:3000/api/gateway/stats"
echo "  http://localhost:3000/api/gateway/health"
echo "  http://localhost:3000/api/gateway/models"
echo ""
echo "🚀 Deploy gateway first:"
echo "  1. Start locally: ~/start-gateway-web.sh"
echo "  2. Or deploy to Railway: cd ~/copilot-agent-gateway && railway up"

