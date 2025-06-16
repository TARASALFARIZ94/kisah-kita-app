// pages/api/user/profile.js

import db from '@/lib/db'; // Asumsi ini adalah instance Prisma Client Anda
import { jwtDecode } from 'jwt-decode'; // Pastikan `jwt-decode` terinstal
// import bcrypt from 'bcryptjs'; // Jika Anda menyimpan password yang di-hash, pastikan bcryptjs terinstal: npm install bcryptjs

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
    req.userEmail = decoded.email; // Ambil email dari token untuk verifikasi password (jika diperlukan)
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

  const userId = req.userId; 

  try {
    if (req.method === 'GET') {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { // Hanya kembalikan data yang aman (jangan password hash)
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      return res.status(200).json(user);

    } else if (req.method === 'PUT') {
      const { name, email, currentPassword, newPassword } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: 'Name and Email are required.' });
      }

      // Opsional: Cek apakah email sudah digunakan oleh user lain (jika email berubah)
      if (email !== req.userEmail) { // req.userEmail didapatkan dari token yang diverifikasi
         const existingUserWithEmail = await db.user.findUnique({
            where: { email: email }
         });
         if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
            return res.status(400).json({ message: 'Email is already taken by another user.' });
         }
      }

      let updateData = { name, email };

      // Logika perubahan password
      if (currentPassword && newPassword) {
        const user = await db.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }

        // --- PENTING: Bandingkan password yang di-hash di produksi ---
        // Jika Anda menyimpan password yang di-hash (sangat disarankan):
        // const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        // Jika Anda menyimpan password plain-text (TIDAK DISARANKAN untuk produksi):
        const isPasswordValid = currentPassword === user.password; // Contoh, jika password disimpan plain-text

        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Incorrect current password.' });
        }

        // --- PENTING: Hash password baru di produksi ---
        // const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash password baru
        updateData.password = newPassword; // Ganti dengan hashedPassword di produksi
      } else if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
        return res.status(400).json({ message: 'Both current and new password are required for password change.' });
      }
      
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: updateData,
        select: { // Hanya kembalikan data yang aman
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return res.status(200).json({ ...updatedUser, message: 'Profile updated successfully.' });

    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error("API Error (User Profile):", error);
    if (error.code === 'P2002') { // Prisma error code for unique constraint violation (e.g., email already exists)
      return res.status(409).json({ message: 'Email address is already in use.' });
    }
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
}
