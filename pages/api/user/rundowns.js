// pages/api/user/rundowns.js

import db from '@/lib/db'; // Asumsi ini adalah instance Prisma Client Anda
import { jwtDecode } from 'jwt-decode'; // Pastikan `jwt-decode` terinstal

// Fungsi middleware sederhana untuk otentikasi dan mendapatkan userId
// PENTING: Untuk lingkungan produksi, VERIFIKASI JWT yang sesungguhnya harus dilakukan di sini.
const authenticateUser = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required. No token provided.' });
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwtDecode(token);
    const userId = decoded.userId || decoded.uid; // Sesuaikan dengan key userId di payload token Anda

    if (!userId) {
      res.status(401).json({ message: 'Invalid token: User ID not found in payload.' });
      return null;
    }
    req.userId = parseInt(userId); // Pastikan userId adalah integer
    return true;
  } catch (error) {
    console.error("Error decoding token (VERIFICATION NEEDED IN PROD):", error);
    res.status(401).json({ message: 'Invalid or expired token.' });
    return null;
  }
};

export default async function handler(req, res) {
  // Jalankan middleware otentikasi
  if (!authenticateUser(req, res)) {
    return;
  }

  const userId = req.userId; // Dapatkan userId dari request setelah otentikasi

  try {
    if (req.method === 'GET') {
      const { tripId } = req.query; // Dapatkan tripId dari query parameter

      if (!tripId) {
        return res.status(400).json({ message: 'Trip ID is required to fetch rundowns.' });
      }

      // Pastikan tripId adalah integer
      const parsedTripId = parseInt(tripId);
      if (isNaN(parsedTripId)) {
        return res.status(400).json({ message: 'Invalid Trip ID.' });
      }

      // Mengambil rundowns untuk trip tertentu milik user yang terautentikasi
      // Pertama, verifikasi apakah tripId ini benar-benar milik user
      const trip = await db.trip.findUnique({
        where: { id: parsedTripId, userId: userId },
      });

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found or does not belong to the authenticated user.' });
      }

      const rundowns = await db.rundown.findMany({
        where: { tripId: parsedTripId },
        orderBy: { activityTime: 'asc' } // Urutkan berdasarkan waktu aktivitas
      });
      return res.status(200).json(rundowns);

    } else if (req.method === 'POST') {
      const { tripId, activityTime, activity } = req.body;

      if (!tripId || !activityTime || !activity) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }

      const parsedTripId = parseInt(tripId);
      if (isNaN(parsedTripId)) {
        return res.status(400).json({ message: 'Invalid Trip ID.' });
      }

      // Verifikasi apakah tripId ini benar-benar milik user yang terautentikasi
      const trip = await db.trip.findUnique({
        where: { id: parsedTripId, userId: userId },
      });

      if (!trip) {
        return res.status(403).json({ message: 'You do not have permission to add rundown to this trip.' });
      }

      const newRundown = await db.rundown.create({
        data: {
          tripId: parsedTripId,
          activityTime: new Date(activityTime),
          activity,
        },
      });

      return res.status(201).json({ ...newRundown, message: 'Rundown created successfully.' });

    } else if (req.method === 'PUT') {
      const { id } = req.query; // Rundown ID dari query parameter
      const { tripId, activityTime, activity } = req.body; // tripId juga dikirim di body untuk verifikasi

      if (!id || !tripId || !activityTime || !activity) {
        return res.status(400).json({ message: 'Missing required fields for update.' });
      }

      const parsedRundownId = parseInt(id);
      const parsedTripId = parseInt(tripId);
      if (isNaN(parsedRundownId) || isNaN(parsedTripId)) {
        return res.status(400).json({ message: 'Invalid ID.' });
      }

      // Verifikasi kepemilikan rundown dan trip
      const existingRundown = await db.rundown.findUnique({
        where: { id: parsedRundownId },
        include: { trip: true } // Include trip to check its userId
      });

      if (!existingRundown || existingRundown.trip.userId !== userId) {
        return res.status(403).json({ message: 'You do not have permission to update this rundown.' });
      }
      
      // Pastikan rundown ini milik trip yang benar (jika tripId di body juga dikirim)
      if (existingRundown.tripId !== parsedTripId) {
          return res.status(400).json({ message: 'Rundown does not belong to the specified trip.' });
      }

      const updatedRundown = await db.rundown.update({
        where: { id: parsedRundownId },
        data: {
          activityTime: new Date(activityTime),
          activity,
        },
      });

      return res.status(200).json({ ...updatedRundown, message: 'Rundown updated successfully.' });

    } else if (req.method === 'DELETE') {
      const { id } = req.query; // Rundown ID dari query parameter

      if (!id) return res.status(400).json({ message: 'Missing rundown ID.' });

      const parsedRundownId = parseInt(id);
      if (isNaN(parsedRundownId)) {
        return res.status(400).json({ message: 'Invalid Rundown ID.' });
      }

      // Verifikasi kepemilikan rundown
      const existingRundown = await db.rundown.findUnique({
        where: { id: parsedRundownId },
        include: { trip: true } // Include trip to check its userId
      });

      if (!existingRundown || existingRundown.trip.userId !== userId) {
        return res.status(403).json({ message: 'You do not have permission to delete this rundown.' });
      }

      await db.rundown.delete({
        where: { id: parsedRundownId },
      });

      return res.status(200).json({ message: 'Rundown deleted successfully.' });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error("API Error:", error);
    // Tangani error khusus Prisma jika diperlukan
    if (error.code === 'P2025') { // Prisma error code for record not found
      return res.status(404).json({ message: 'Record not found.' });
    }
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
}
