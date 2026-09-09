import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { DEFAULT_CLOUDINARY_CONFIG } from '@/lib/cloudinaryConfig';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { public_id } = body;
    const cloud_name = body.cloud_name || DEFAULT_CLOUDINARY_CONFIG.cloudName;
    const api_key = body.api_key || DEFAULT_CLOUDINARY_CONFIG.apiKey;
    const api_secret = body.api_secret || DEFAULT_CLOUDINARY_CONFIG.apiSecret;

    if (!public_id) {
      return NextResponse.json({ error: 'Missing public_id parameter' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Generate signature
    const strToSign = `public_id=${public_id}&timestamp=${timestamp}${api_secret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', public_id);
    formData.append('api_key', api_key);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
