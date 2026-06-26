import crypto from "crypto";

function getCredentials() {
  // Support both CLOUDINARY_URL and individual vars
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    // cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
  }
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  };
}

function sign(params: Record<string, string>, apiSecret: string): string {
  const str = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha256").update(str + apiSecret).digest("hex");
}

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string,
  publicId?: string
): Promise<string> {
  const { cloudName, apiKey, apiSecret } = getCredentials();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not configured");
  }

  const timestamp = String(Math.round(Date.now() / 1000));
  const params: Record<string, string> = { folder, timestamp };
  if (publicId) params.public_id = publicId;

  const signature = sign(params, apiSecret);

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(fileBuffer)]));
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);
  form.append("folder", folder);
  if (publicId) form.append("public_id", publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[Cloudinary] Upload failed:", res.status, body);
    throw new Error(`Cloudinary error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}

export async function deleteImage(publicId: string): Promise<void> {
  const { cloudName, apiKey, apiSecret } = getCredentials();
  const timestamp = String(Math.round(Date.now() / 1000));
  const params = { public_id: publicId, timestamp };
  const signature = sign(params, apiSecret);

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body: form,
  });
}
