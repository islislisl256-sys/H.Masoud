import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { public_id, cloud_name, api_key, api_secret } = await request.json();

    if (!public_id || !cloud_name || !api_key || !api_secret) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Generate signature
    const strToSign = `public_id=${public_id}&timestamp=${timestamp}${api_secret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `public_id=${public_id}&api_key=${api_key}&timestamp=${timestamp}&signature=${signature}`
    });

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
