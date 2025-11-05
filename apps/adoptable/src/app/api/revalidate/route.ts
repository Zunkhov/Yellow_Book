import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag, secret } = body;
    
    // Optional: Add secret key protection
    if (secret !== process.env.REVALIDATION_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag is required' },
        { status: 400 }
      );
    }
    
    // Revalidate the specific tag
    revalidateTag(tag);
    
    console.log(`✅ Revalidated tag: ${tag}`);
    
    return NextResponse.json({ 
      revalidated: true, 
      tag,
      now: Date.now() 
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'Revalidation endpoint. Use POST with { tag: "entry-{id}" }',
    example: {
      method: 'POST',
      body: { 
        tag: 'entry-123',
        secret: 'your-secret'
      }
    }
  });
}