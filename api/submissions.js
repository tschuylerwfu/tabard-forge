import { list, del } from '@vercel/blob';

// Admin-only: list or delete submissions. Requires ADMIN_PASSWORD env var.
export default async function handler(req, res) {
  const password = req.headers['x-admin-password'];
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: 'submissions/', limit: 1000 });
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      return res.status(200).json({
        submissions: blobs.map((b) => ({
          url: b.url,
          pathname: b.pathname,
          size: b.size,
          uploadedAt: b.uploadedAt,
        })),
      });
    }
    if (req.method === 'DELETE') {
      const { url } = req.body || {};
      if (!url) return res.status(400).json({ error: 'Missing url' });
      await del(url);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
