// pages/api/user/photos.js

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
        return res.status(400).json({ message: 'Trip ID is required to fetch photos.' });
      }

      const parsedTripId = parseInt(tripId);
      if (isNaN(parsedTripId)) {
        return res.status(400).json({ message: 'Invalid Trip ID.' });
      }

      // Pertama, verifikasi apakah tripId ini benar-benar milik user
      const trip = await db.trip.findUnique({
        where: { id: parsedTripId, userId: userId },
      });

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found or does not belong to the authenticated user.' });
      }

      const photos = await db.photo.findMany({
        where: { tripId: parsedTripId },
        orderBy: { id: 'asc' } // Urutkan berdasarkan ID
      });
      return res.status(200).json(photos);

    } else if (req.method === 'POST') {
      // Hapus 'reported' dari destructuring req.body
      const { tripId, gdriveLink } = req.body; 

      if (!tripId || !gdriveLink) {
        return res.status(400).json({ message: 'Missing required fields: tripId, gdriveLink.' });
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
        return res.status(403).json({ message: 'You do not have permission to add photos to this trip.' });
      }

      const newPhoto = await db.photo.create({
        data: {
          tripId: parsedTripId,
          gdriveLink,
          // Kolom 'reported' tidak perlu disertakan di sini.
          // Database akan mengisi nilai default 0 (false) secara otomatis.
        },
      });

      return res.status(201).json({ ...newPhoto, message: 'Photo added successfully.' });

    } else if (req.method === 'PUT') {
      const { id } = req.query; // Photo ID dari query parameter
      const { gdriveLink, reported, tripId } = req.body; // tripId juga dikirim untuk verifikasi

      // Pemeriksaan tipe untuk 'reported' memastikan bahwa ia adalah boolean atau dapat dikonversi
      if (!id || !gdriveLink || typeof reported === 'undefined' || !tripId) {
        return res.status(400).json({ message: 'Missing required fields for update (id, gdriveLink, reported, tripId).' });
      }

      const parsedPhotoId = parseInt(id);
      const parsedTripId = parseInt(tripId);

      if (isNaN(parsedPhotoId) || isNaN(parsedTripId)) {
        return res.status(400).json({ message: 'Invalid Photo or Trip ID.' });
      }

      // Verifikasi kepemilikan foto dan trip yang terkait
      const existingPhoto = await db.photo.findUnique({
        where: { id: parsedPhotoId },
        include: { trip: true } // Include trip to check its userId
      });

      if (!existingPhoto || existingPhoto.trip.userId !== userId || existingPhoto.tripId !== parsedTripId) {
        return res.status(403).json({ message: 'You do not have permission to update this photo or it does not belong to the specified trip.' });
      }
      
      const updatedPhoto = await db.photo.update({
        where: { id: parsedPhotoId },
        data: {
          gdriveLink,
          reported: Boolean(reported), // Pastikan ini adalah boolean
        },
      });

      return res.status(200).json({ ...updatedPhoto, message: 'Photo updated successfully.' });

    } else if (req.method === 'DELETE') {
      const { id } = req.query; // Photo ID dari query parameter

      if (!id) return res.status(400).json({ message: 'Missing photo ID.' });

      const parsedPhotoId = parseInt(id);
      if (isNaN(parsedPhotoId)) {
        return res.status(400).json({ message: 'Invalid Photo ID.' });
      }

      // Verifikasi kepemilikan foto sebelum menghapus
      const existingPhoto = await db.photo.findUnique({
        where: { id: parsedPhotoId },
        include: { trip: true } // Include trip to check its userId
      });

      if (!existingPhoto || existingPhoto.trip.userId !== userId) {
        return res.status(403).json({ message: 'You do not have permission to delete this photo.' });
      }

      await db.photo.delete({
        where: { id: parsedPhotoId },
      });

      return res.status(200).json({ message: 'Photo deleted successfully.' });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error("API Error:", error);
    if (error.code === 'P2025') { 
      return res.status(404).json({ message: 'Record not found.' });
    }
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
}