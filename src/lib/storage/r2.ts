import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// R2 configuration from environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!; // Your custom domain or R2.dev URL

// Create S3 client configured for Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Generate a unique filename with timestamp and random suffix
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop() || "jpg";
  const baseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
  return `${baseName}-${timestamp}-${randomSuffix}.${extension}`;
}

/**
 * Upload a reference image to Cloudflare R2 storage
 *
 * @param file - The file to upload
 * @param brandId - The brand ID for organizing uploads (optional for new brands)
 * @returns The public URL and storage key of the uploaded file
 */
export async function uploadReferenceImage(
  file: File,
  brandId?: string
): Promise<UploadResult> {
  const uniqueFilename = generateUniqueFilename(file.name);

  // Organize by brand or use temp folder for new brand flow
  const key = brandId
    ? `brands/${brandId}/references/${uniqueFilename}`
    : `temp/references/${uniqueFilename}`;

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // Cache for 1 year (immutable content)
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  // Return public URL
  const url = `${R2_PUBLIC_URL}/${key}`;

  return { url, key };
}

/**
 * Delete a file from R2 storage
 *
 * @param key - The storage key of the file to delete
 */
export async function deleteFile(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Upload a buffer directly to R2 (useful for generated images)
 *
 * @param buffer - The buffer to upload
 * @param key - The storage key
 * @param contentType - The MIME type
 * @returns The public URL
 */
export async function uploadBuffer(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}
