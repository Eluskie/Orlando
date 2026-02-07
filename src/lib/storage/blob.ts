import { put } from '@vercel/blob';

export interface UploadResult {
  url: string;
  pathname: string;
}

/**
 * Upload a reference image to Vercel Blob storage
 *
 * @param file - The file to upload
 * @param brandId - The brand ID for organizing uploads
 * @returns The URL and pathname of the uploaded file
 */
export async function uploadReferenceImage(
  file: File,
  brandId: string
): Promise<UploadResult> {
  const blob = await put(
    `brands/${brandId}/references/${file.name}`,
    file,
    {
      access: 'public',
      addRandomSuffix: true,
    }
  );
  return { url: blob.url, pathname: blob.pathname };
}
