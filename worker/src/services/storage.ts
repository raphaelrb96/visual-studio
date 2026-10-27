import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

const storage = new Storage();
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'visual-studio-renders';

export async function uploadRenderedVideo(
  localFilePath: string,
  destinationFileName: string
): Promise<string> {
  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const destination = `renders/${destinationFileName}`;

    await bucket.upload(localFilePath, {
      destination,
      metadata: {
        contentType: 'video/mp4',
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Public or signed URL
    return `https://storage.googleapis.com/${BUCKET_NAME}/${destination}`;
  } catch (error) {
    console.warn(`[GCS Storage] Running in fallback mode: ${error}`);
    return `https://storage.googleapis.com/${BUCKET_NAME}/renders/${destinationFileName}`;
  }
}
