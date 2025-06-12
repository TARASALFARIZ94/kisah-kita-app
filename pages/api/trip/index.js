import db from '@/lib/db';

export default async function handler(req, res) {
  const method = req.method;

  try {
    if (method === 'GET') {
      const { tripId } = req.query;

      if (tripId) {
        const trip = await db.trip.findUnique({
          where: { id: parseInt(tripId) },
        });
        if (!trip) return res.status(404).json({ error: 'Trip not found' });
        return res.status(200).json(trip);
      }

      const trips = await db.trip.findMany();
      return res.status(200).json(trips);
    }

    if (method === 'POST') {
      const { userId, title, destination, startDate, endDate } = req.body;

      if (!userId || !title || !destination || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newTrip = await db.trip.create({
        data: {
          userId: parseInt(userId),
          title,
          destination,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      return res.status(201).json(newTrip);
    }

    if (method === 'PUT') {
      const { id, title, destination, startDate, endDate } = req.body;

      if (!id || !title || !destination || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields for update' });
      }

      const updatedTrip = await db.trip.update({
        where: { id: parseInt(id) },
        data: {
          title,
          destination,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      return res.status(200).json(updatedTrip);
    }

    if (method === 'DELETE') {
      const { id } = req.body;

      if (!id) return res.status(400).json({ error: 'Missing trip id' });

      await db.trip.delete({
        where: { id: parseInt(id) },
      });

      return res.status(200).json({ message: 'Trip deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}