// pages/api/bills/index.js

import db from '@/lib/db'; // Sesuaikan path jika berbeda

export default async function handler(req, res) {
  // DEBUGGING: Log request yang diterima
  console.log(`[API /api/bills] Received request. Method: ${req.method}`);

  // Dummy Authentication Check (Anda perlu mengganti ini dengan sistem autentikasi nyata Anda)
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.warn(`[API /api/bills] No authorization token provided.`);
    return res.status(401).json({ message: 'Authorization token missing.' });
  }
  // TODO: Di sini Anda harus memverifikasi token dan mendapatkan ID pengguna.
  // Misalnya:
  // const userId = verifyAuthToken(token);
  // if (!userId) {
  //   return res.status(401).json({ message: 'Invalid or expired token.' });
  // }

  if (req.method === 'GET') {
    try {
      // Fetch all bills (Anda mungkin ingin memfilter ini berdasarkan userId yang terautentikasi)
      const bills = await db.bill.findMany({
        include: { expenses: true } // Sertakan expenses agar frontend tidak perlu fetch terpisah
      });
      // DEBUGGING: Log data yang akan dikirim
      console.log(`[API /api/bills] Successfully fetched bills. Count: ${bills.length}`);
      return res.status(200).json(bills); // Pastikan ini mengembalikan JSON
    } catch (error) {
      console.error('[API /api/bills] Backend Error: Failed to fetch bills:', error);
      // PENTING: Selalu kirim respons JSON, bahkan saat error
      return res.status(500).json({ message: 'Failed to fetch bills.', error: error.message });
    }
  } else if (req.method === 'POST') {
    const { name, participants } = req.body;

    if (!name || typeof name !== 'string' || !Array.isArray(participants) || participants.length === 0) {
      console.warn('[API /api/bills] Missing or invalid fields for bill creation:', req.body);
      return res.status(400).json({ message: 'Missing required fields: name (string), and at least one participant (array of strings).' });
    }

    try {
      const newBill = await db.bill.create({
        data: {
          name,
          participants: participants, // db Client akan otomatis meng-handle JSON stringification
          // Tambahkan creatorId jika Anda memiliki relasi user ke bill
          // creatorId: userId,
        },
      });
      console.log(`[API /api/bills] Bill created successfully with ID: ${newBill.id}`);
      return res.status(201).json(newBill);
    } catch (error) {
      console.error('[API /api/bills] Backend Error: Failed to create bill:', error);
      return res.status(500).json({ message: 'Failed to create bill.', error: error.message });
    }
  } else {
    console.warn(`[API /api/bills] Method Not Allowed: ${req.method}`);
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}