import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const photos = await db.photo.findMany();
      return res.status(200).json(photos);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch photos' });
    }
  }

  if (req.method === 'POST') {
    const { tripId, gdriveLink } = req.body;

    if (!tripId || !gdriveLink) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newPhoto = await db.photo.create({
        data: { tripId, gdriveLink }
      });
      return res.status(201).json(newPhoto);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create photo' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}