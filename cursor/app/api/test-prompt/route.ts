import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Log the request details
    console.log('Test prompt request received:', {
      webhookUrl: process.env.N8N_WEBHOOK_URL,
      hasUsername: !!process.env.N8N_WEBHOOK_USERNAME,
      hasPassword: !!process.env.N8N_WEBHOOK_PASSWORD,
      requestBody: body
    })
    
    if (!process.env.N8N_WEBHOOK_URL) {
      throw new Error('N8N_WEBHOOK_URL is not configured')
    }

    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.N8N_WEBHOOK_USERNAME}:${process.env.N8N_WEBHOOK_PASSWORD}`).toString('base64')}`
      },
      body: JSON.stringify(body)
    })

    // Log the response status
    console.log('Webhook response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Webhook error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in test-prompt route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to test prompt' },
      { status: 500 }
    )
  }
} 