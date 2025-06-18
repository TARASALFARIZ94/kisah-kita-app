// pages/api/user/trips.js

import db from '@/lib/db'; // Asumsi ini adalah instance Prisma Client Anda
import { jwtDecode } from 'jwt-decode'; // Pastikan `jwt-decode` terinstal: npm install jwt-decode

// Fungsi middleware sederhana untuk otentikasi dan mendapatkan userId
// PENTING: Untuk lingkungan produksi, VERIFIKASI JWT yang sesungguhnya harus dilakukan di sini.
// Contoh: menggunakan 'jsonwebtoken' untuk jwt.verify(token, process.env.JWT_SECRET)
// atau Firebase Admin SDK untuk memverifikasi token ID jika menggunakan Firebase Auth.
const authenticateUser = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required. No token provided.' });
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    // --- DEMO ONLY: JANGAN GUNAKAN jwtDecode UNTUK VERIFIKASI PRODUKSI ---
    // Ini hanya mendecode payload, TIDAK MEMVERIFIKASI SIGNATURE TOKEN.
    // Di produksi, token harus diverifikasi dengan secret key Anda.
    const decoded = jwtDecode(token);
    const userId = decoded.userId || decoded.uid; // Sesuaikan dengan key userId di payload token Anda

    if (!userId) {
      res.status(401).json({ message: 'Invalid token: User ID not found in payload.' });
      return null;
    }
    req.userId = parseInt(userId); // Pastikan userId adalah integer jika di database adalah Int
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
    return; // Berhenti jika otentikasi gagal (respons sudah dikirim oleh authenticateUser)
  }

  const userId = req.userId; // Dapatkan userId dari request setelah otentikasi

  try {
    if (req.method === 'GET') {
      const { id } = req.query; // Menggunakan 'id' sebagai query parameter untuk GET single trip

      if (id) {
        // GET single trip by ID, filter juga berdasarkan userId
        const trip = await db.trip.findUnique({
          where: { 
            id: parseInt(id),
            userId: userId // Pastikan hanya bisa mengambil trip milik sendiri
          },
        });
        if (!trip) return res.status(404).json({ message: 'Trip not found or you do not own this trip.' });
        return res.status(200).json(trip);
      }

      // GET all trips for the authenticated user
      const trips = await db.trip.findMany({
        where: { userId: userId }, // Filter trips berdasarkan userId yang terautentikasi
        orderBy: { startDate: 'desc' } // Urutkan berdasarkan tanggal mulai terbaru
      });
      return res.status(200).json(trips);
    }

    if (req.method === 'POST') {
      const { title, destination, startDate, endDate } = req.body;

      if (!title || !destination || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }

      const newTrip = await db.trip.create({
        data: {
          userId: userId, // Gunakan userId dari pengguna yang terautentikasi
          title,
          destination,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      return res.status(201).json({ ...newTrip, message: 'Trip created successfully.' });
    }

    if (req.method === 'PUT') {
      const { id } = req.query; // ID dari URL: /api/user/trips/123
      const { title, destination, startDate, endDate } = req.body;

      if (!id || !title || !destination || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields for update.' });
      }

      // Pastikan pengguna hanya bisa update trip miliknya sendiri
      const updatedTrip = await db.trip.update({
        where: { 
          id: parseInt(id),
          userId: userId // Pastikan hanya bisa update trip milik sendiri
        },
        data: {
          title,
          destination,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      return res.status(200).json({ ...updatedTrip, message: 'Trip updated successfully.' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query; // ID dari URL: /api/user/trips/123

      if (!id) return res.status(400).json({ message: 'Missing trip ID.' });

      // --- LOGIKA PENCEGAHAN PENGHAPUSAN JIKA ADA DEPENDENSI ---
      const tripIdInt = parseInt(id);

      // Periksa dependensi pada model 'Rundown'
      const dependentRundownsCount = await db.rundown.count({
        where: {
          tripId: tripIdInt,
        },
      });

      // Periksa dependensi pada model 'Photo'
      const dependentPhotosCount = await db.photo.count({
        where: {
          tripId: tripIdInt,
        },
      });

      if (dependentRundownsCount > 0 || dependentPhotosCount > 0) {
        let message = `Tidak dapat menghapus perjalanan (ID: ${id}) karena masih memiliki catatan terkait. Harap hapus catatan terkait terlebih dahulu.`;
        if (dependentRundownsCount > 0) {
          message += ` Ditemukan ${dependentRundownsCount} rundown.`;
        }
        if (dependentPhotosCount > 0) {
          message += ` Ditemukan ${dependentPhotosCount} foto.`;
        }
        return res.status(400).json({ message });
      }

      // Jika tidak ada dependensi, lanjutkan dengan penghapusan trip
      // Pastikan pengguna hanya bisa delete trip miliknya sendiri
      const deletedTrip = await db.trip.deleteMany({
        where: { 
          id: tripIdInt,
          userId: userId // Pastikan hanya bisa delete trip milik sendiri
        },
      });

      // Periksa apakah trip benar-benar dihapus
      if (deletedTrip.count === 0) {
        return res.status(404).json({ message: 'Trip not found or you do not have permission to delete this trip.' });
      }

      return res.status(200).json({ message: 'Trip deleted successfully.' });
    }

    // Jika method tidak cocok
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error("API Error:", error);
    // Tangani error jika trip tidak ditemukan atau bukan milik user
    // P2025: Record not found (bisa terjadi jika trip tidak ada saat update/delete,
    // meskipun kita sudah melakukan filter userId)
    if (error.code === 'P2025') { 
      return res.status(404).json({ message: 'Trip not found or you do not have permission.' });
    }
    // P2003: Foreign key constraint violation (seharusnya tidak tercapai dengan logika pencegahan di atas,
    // tetapi baik untuk tetap ada sebagai fallback)
    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Cannot delete trip due to existing dependencies.', details: error.meta });
    }
    // Menangkap TypeError jika properti 'count' tidak dapat diakses (misal: db.model undefined)
    if (error instanceof TypeError && error.message.includes("Cannot read properties of undefined (reading 'count')")) {
      return res.status(500).json({ message: 'Kesalahan internal server: Model database tidak ditemukan atau belum digenerate. Pastikan `db.rundown` dan `db.photo` ada di skema Prisma Anda dan jalankan `npx prisma generate`.', error: error.message });
    }
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
}