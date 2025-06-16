// pages/api/faqs.js

import db from '@/lib/db'; // Asumsi ini adalah instance Prisma Client Anda

// PENTING:
// Middleware otentikasi admin telah dihapus dari sini karena Anda meminta
// API ini berada di path '/api/faqs', yang menyiratkan akses publik.
// Jika Anda ingin operasi POST/PUT/DELETE tetap admin-only,
// Anda harus menambahkan kembali logika otentikasi/otorisasi di sini
// atau menggunakan middleware Next.js yang lebih canggih.

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { id } = req.query; // Opsional: untuk mendapatkan FAQ tunggal

      if (id) {
        const faq = await db.fAQ.findUnique({
          where: { id: parseInt(id) },
        });
        if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
        return res.status(200).json(faq);
      }

      // Mengambil semua FAQ (publik)
      const faqs = await db.fAQ.findMany({
        orderBy: { createdAt: 'desc' } // Urutkan berdasarkan yang terbaru
      });
      return res.status(200).json(faqs);

    } else if (req.method === 'POST') {
      // PENTING: Operasi ini sekarang dapat diakses secara publik.
      // Lindungi dengan otentikasi/otorisasi jika tidak diinginkan.
      const { question, answer } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ message: 'Question and Answer are required.' });
      }

      const newFaq = await db.fAQ.create({
        data: {
          question,
          answer,
        },
      });

      return res.status(201).json({ ...newFaq, message: 'FAQ created successfully.' });

    } else if (req.method === 'PUT') {
      // PENTING: Operasi ini sekarang dapat diakses secara publik.
      // Lindungi dengan otentikasi/otorisasi jika tidak diinginkan.
      const { id } = req.query; // FAQ ID dari query parameter
      const { question, answer } = req.body;

      if (!id || !question || !answer) {
        return res.status(400).json({ message: 'Missing required fields for update.' });
      }

      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        return res.status(400).json({ message: 'Invalid FAQ ID.' });
      }

      const updatedFaq = await db.fAQ.update({
        where: { id: parsedId },
        data: {
          question,
          answer,
        },
      });

      return res.status(200).json({ ...updatedFaq, message: 'FAQ updated successfully.' });

    } else if (req.method === 'DELETE') {
      // PENTING: Operasi ini sekarang dapat diakses secara publik.
      // Lindungi dengan otentikasi/otorisasi jika tidak diinginkan.
      const { id } = req.query; // FAQ ID dari query parameter

      if (!id) return res.status(400).json({ message: 'Missing FAQ ID.' });

      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        return res.status(400).json({ message: 'Invalid FAQ ID.' });
      }

      await db.fAQ.delete({
        where: { id: parsedId },
      });

      return res.status(200).json({ message: 'FAQ deleted successfully.' });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error("API Error (FAQ):", error);
    if (error.code === 'P2025') { 
      return res.status(404).json({ message: 'FAQ not found.' });
    }
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
}
