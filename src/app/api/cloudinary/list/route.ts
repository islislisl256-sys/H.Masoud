import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cloud_name, api_key, api_secret } = await request.json();

    if (!cloud_name || !api_key || !api_secret) {
      return NextResponse.json({ error: 'Missing API credentials' }, { status: 400 });
    }

    const auth = btoa(`${api_key}:${api_secret}`);

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