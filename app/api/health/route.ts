import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    service: 'HavenzHub Frontend',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    backends: {
      aspnet: process.env.NEXT_PUBLIC_ASPNET_API || 'http://localhost:5000',
      python: process.env.NEXT_PUBLIC_PYTHON_API || 'http://localhost:8001',
    }
  });
}
