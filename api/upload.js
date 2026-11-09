import { handleUpload } from '@vercel/blob/client';

// Issues short-lived upload tokens so the browser can send images straight to
// Vercel Blob (this avoids the 4.5 MB request limit on serverless functions).
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const jsonResponse = await handleUpload({
      body: request.body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith('submissions/')) {
          throw new Error('Invalid upload path');
        }
        return {
          allowedContentTypes: ['image/png', 'image/jpeg', 'image/webp'],
          maximumSizeInBytes: 15 * 1024 * 1024, // 15 MB per screenshot
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
}
