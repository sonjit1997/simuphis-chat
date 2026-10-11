import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in form data" },
        { status: 400 }
      );
    }

    // 1. Server-Side MIME Type Validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported media format "${file.type}". Allowed formats: JPEG, PNG, WEBP, GIF, MP4, WEBM, QuickTime.`,
        },
        { status: 415 }
      );
    }

    // 2. Server-Side File Size Cap Validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 50MB maximum upload limit" },
        { status: 413 }
      );
    }

    const isVideo = file.type.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name && file.name !== "blob" ? file.name : "uploaded-media";

    // 3. Upload to Cloudinary if credentials are provided
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "simuphish_chat",
            resource_type: resourceType,
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed"));
            } else {
              resolve(result as { secure_url: string });
            }
          }
        );
        stream.end(buffer);
      });

      return NextResponse.json({
        success: true,
        mediaUrl: uploadResult.secure_url,
        fileName,
        fileSize: file.size,
        mimeType: file.type,
        type: isVideo ? "video" : "image",
      });
    }

    // 4. Graceful Fallback if Cloudinary credentials are being setup:
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      mediaUrl: dataUrl,
      fileName,
      fileSize: file.size,
      mimeType: file.type,
      type: isVideo ? "video" : "image",
      note: "Served via local data URL until Cloudinary credentials are provided",
    });
  } catch (err: any) {
    console.error("[Upload API Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process media upload" },
      { status: 500 }
    );
  }
}
