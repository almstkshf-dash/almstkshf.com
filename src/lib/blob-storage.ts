import { put } from '@vercel/blob';

/**
 * Downloads an image from a given URL and uploads it to Vercel Blob.
 * Returns the permanent Vercel Blob URL.
 * Falls back to the original URL if the upload fails.
 */
export async function uploadImageToBlob(imageUrl: string, prefix: string = 'articles'): Promise<string> {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Avoid re-uploading if it's already a Vercel Blob
  if (imageUrl.includes('public.blob.vercel-storage.com')) {
    return imageUrl;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Blob] Failed to fetch image ${imageUrl}: ${response.status}`);
      return imageUrl;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const blob = await response.blob();
    
    // Generate a unique filename
    const extension = contentType.split('/')[1] || 'jpg';
    const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    const { url } = await put(filename, blob, {
      access: 'public',
      contentType: contentType,
    });

    console.log(`[Blob] Successfully uploaded image to ${url}`);
    return url;

  } catch (error) {
    console.error(`[Blob] Error uploading image ${imageUrl} to Vercel Blob:`, error);
    return imageUrl; // Fallback to original URL
  }
}
