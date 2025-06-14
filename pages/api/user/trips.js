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

      // Pastikan pengguna hanya bisa delete trip miliknya sendiri
      await db.trip.deleteMany({ // Menggunakan deleteMany untuk menambahkan filter userId
        where: { 
          id: parseInt(id),
          userId: userId // Pastikan hanya bisa delete trip milik sendiri
        },
      });

      // Periksa apakah trip benar-benar dihapus (opsional, jika yakin ID & userId selalu unik)
      // Jika deleteMany tidak menghapus apapun (karena tidak ditemukan atau bukan milik user),
      // Anda bisa mengecek hasilnya untuk memberikan respons 404/403 yang lebih spesifik.
      // Namun, untuk kesederhanaan, kita asumsikan 200 OK jika query berjalan tanpa error.

      return res.status(200).json({ message: 'Trip deleted successfully.' });
    }

    // Jika method tidak cocok
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error("API Error:", error);
    // Tangani error jika trip tidak ditemukan atau bukan milik user
    if (error.code === 'P2025') { // Prisma error code for record not found
      return res.status(404).json({ message: 'Trip not found or you do not have permission.' });
    }
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
}
