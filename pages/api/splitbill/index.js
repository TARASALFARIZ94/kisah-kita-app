import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const bills = await db.splitBill.findMany();
      return res.status(200).json(bills);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch split bills' });
    }
  }

  if (req.method === 'POST') {
    const { tripId, payer, amount, participants } = req.body;

    if (!tripId || !payer || !amount || !participants) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newBill = await db.splitBill.create({
        data: {
          tripId,
          payer,
          amount,
          participants: JSON.stringify(participants) // bisa array dari frontend
        }
      });
      return res.status(201).json(newBill);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create split bill' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}