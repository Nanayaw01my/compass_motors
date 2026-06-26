import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Temporary diagnostic endpoint — remove after fixing uploads
export async function GET() {
  const url = process.env.CLOUDINARY_URL;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const config = {
    hasUrl: !!url,
    urlPreview: url ? url.slice(0, 30) + "..." : null,
    cloudName: cloudName || null,
    apiKeyPrefix: apiKey ? apiKey.slice(0, 6) + "..." : null,
    apiSecretLength: apiSecret ? apiSecret.length : null,
  };

  try {
    if (url) {
      // CLOUDINARY_URL auto-configures the SDK
    } else {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    }
    const result = await cloudinary.api.ping();
    return NextResponse.json({ ok: true, ping: result, config });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, config }, { status: 500 });
  }
}
