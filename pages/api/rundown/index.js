import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const rundowns = await db.rundown.findMany();
      return res.status(200).json(rundowns);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch rundown' });
    }
  }

  if (req.method === 'POST') {
    const { tripId, activityTime, activity } = req.body;

    if (!tripId || !activityTime || !activity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newRundown = await db.rundown.create({
        data: { tripId, activityTime: new Date(activityTime), activity }
      });
      return res.status(201).json(newRundown);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create rundown' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}