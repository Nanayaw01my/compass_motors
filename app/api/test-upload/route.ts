import { NextResponse } from "next/server";
import crypto from "crypto";

// Temporary diagnostic endpoint — remove after fixing uploads
export async function GET() {
  const url = process.env.CLOUDINARY_URL;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  let resolvedCloudName = cloudName || "";
  let resolvedApiKey = apiKey || "";
  let resolvedApiSecret = apiSecret || "";

  if (url) {
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      resolvedApiKey = match[1];
      resolvedApiSecret = match[2];
      resolvedCloudName = match[3];
    }
  }

  const config = {
    source: url ? "CLOUDINARY_URL" : "individual vars",
    cloudName: resolvedCloudName || "MISSING",
    apiKeyPrefix: resolvedApiKey ? resolvedApiKey.slice(0, 6) + "..." : "MISSING",
    apiSecretLength: resolvedApiSecret ? resolvedApiSecret.length : 0,
  };

  if (!resolvedCloudName || !resolvedApiKey || !resolvedApiSecret) {
    return NextResponse.json({ ok: false, error: "Missing credentials", config });
  }

  // Try a simple signed API call to verify credentials
  try {
    const timestamp = String(Math.round(Date.now() / 1000));
    const str = `timestamp=${timestamp}${resolvedApiSecret}`;
    const signature = crypto.createHash("sha256").update(str).digest("hex");

    const form = new FormData();
    form.append("timestamp", timestamp);
    form.append("api_key", resolvedApiKey);
    form.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${resolvedCloudName}/resources/image?max_results=1`, {
      headers: { Authorization: `Basic ${Buffer.from(`${resolvedApiKey}:${resolvedApiSecret}`).toString("base64")}` },
    });

    const body = await res.text();
    return NextResponse.json({ ok: res.ok, status: res.status, body: body.slice(0, 200), config });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, config });
  }
}
