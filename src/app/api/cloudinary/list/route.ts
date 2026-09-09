import { NextResponse } from 'next/server';
import { DEFAULT_CLOUDINARY_CONFIG } from '@/lib/cloudinaryConfig';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const cloud_name = body.cloud_name || DEFAULT_CLOUDINARY_CONFIG.cloudName;
    const api_key = body.api_key || DEFAULT_CLOUDINARY_CONFIG.apiKey;
    const api_secret = body.api_secret || DEFAULT_CLOUDINARY_CONFIG.apiSecret;

    const auth = Buffer.from(`${api_key}:${api_secret}`).toString('base64');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/resources/image?max_results=500`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}