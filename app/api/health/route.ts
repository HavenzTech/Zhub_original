import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Auth check — don't expose backend URLs to unauthenticated users
  const authHeader = request.headers.get('authorization')
  const authCookie = request.cookies.get('auth-token')?.value
  if (!authHeader && !authCookie) {
    // Return basic health status without backend details
    return NextResponse.json({
      service: 'HavenzHub Frontend',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    service: 'HavenzHub Frontend',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
