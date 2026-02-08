import { NextResponse } from "next/server";
import { uploadReferenceImage } from "@/lib/storage/r2";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";

/**
 * POST /api/upload
 *
 * Upload a file to Cloudflare R2 storage and create an asset record.
 * Accepts FormData with:
 * - file: The file to upload
 * - brandId: Brand ID for organizing uploads (required for asset creation)
 *
 * Returns: { url: string, key: string, assetId?: string }
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const brandId = formData.get("brandId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images only)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const result = await uploadReferenceImage(file, brandId || undefined);

    // If brandId provided, create an asset record in the database
    let assetId: string | undefined;
    if (brandId) {
      try {
        const [asset] = await db
          .insert(assets)
          .values({
            brandId,
            url: result.url,
            name: file.name || "Uploaded image",
            type: "custom",
            // Default canvas position (will be distributed on canvas)
            canvasX: null,
            canvasY: null,
            canvasScale: 1,
          })
          .returning({ id: assets.id });

        assetId = asset.id;
      } catch (dbError) {
        console.error("Failed to create asset record:", dbError);
        // Continue without asset record - image is still uploaded
      }
    }

    return NextResponse.json({
      url: result.url,
      key: result.key,
      assetId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
