import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json(
      { error: "API secret not configured" },
      { status: 500 }
    );
  }

  try {
    const { public_id, timestamp } = await req.json();
    const stringToSign = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;

    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    return new Response(signature);
  } catch (error) {
    console.error("Signature error:", error);
    return NextResponse.json(
      { error: "Signature generation failed" },
      { status: 500 }
    );
  }
}
