// pages/api/bills/[id]/expenses.js

import db from '@/lib/db'; // Sesuaikan path jika berbeda

export default async function handler(req, res) {
  const { id: billId } = req.query; // Ini akan menjadi UUID string dari URL

  console.log(`[API /api/bills/[id]/expenses] Received POST request for Bill ID: ${billId}`);
  console.log('[API /api/bills/[id]/expenses] Request Body:', req.body);

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.warn(`[API /api/bills/[id]/expenses] No authorization token provided.`);
    return res.status(401).json({ message: 'Authorization token missing.' });
  }
  // TODO: Verifikasi token dan pastikan user berhak menambahkan expense ke bill ini

  // Validasi basic format UUID untuk billId
  if (typeof billId !== 'string' || !billId.match(/^[0-9a-fA-F-]{36}$/)) {
    console.error('[API /api/bills/[id]/expenses] Invalid billId format received:', billId);
    return res.status(400).json({ message: 'Invalid Bill ID format. Expected a UUID string.' });
  }

  if (req.method === 'POST') {
    // Ambil quantity dan totalAmount dari body
    const { description, quantity, totalAmount, paidBy, splitAmong } = req.body;

    // --- PERBAIKAN: Validasi quantity dan totalAmount ---
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ message: 'Description is required and must be a string.' });
    }
    if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) { // Validasi quantity sebagai integer positif
      return res.status(400).json({ message: 'Quantity is required and must be a positive integer.' });
    }
    if (typeof totalAmount !== 'number' || totalAmount <= 0) { // totalAmount bisa float sekarang
      return res.status(400).json({ message: 'Total amount is required and must be a positive number.' });
    }
    if (!paidBy || typeof paidBy !== 'string' || paidBy.trim() === '') {
      return res.status(400).json({ message: 'PaidBy is required and must be a string.' });
    }
    if (!Array.isArray(splitAmong) || splitAmong.length === 0) {
      return res.status(400).json({ message: 'SplitAmong must be an array of strings with at least one participant.' });
    }
    if (splitAmong.some(p => typeof p !== 'string' || p.trim() === '')) {
      return res.status(400).json({ message: 'All participants in splitAmong must be non-empty strings.' });
    }

    try {
      const existingBill = await db.bill.findUnique({
        where: { id: billId }
      });

      if (!existingBill) {
        console.warn(`[API /api/bills/[id]/expenses] Bill with ID ${billId} not found for expense creation.`);
        return res.status(404).json({ message: 'Parent Bill not found with the provided ID.' });
      }

      const newExpense = await db.expense.create({
        data: {
          bill: { connect: { id: billId } },
          description,
          quantity,    // <-- Simpan quantity
          totalAmount, // <-- Simpan totalAmount yang sudah dikalikan dari frontend
          paidBy,
          splitAmong,
        },
      });
      console.log(`[API /api/bills/[id]/expenses] Expense created successfully with ID: ${newExpense.id} for Bill: ${billId}`);
      return res.status(201).json(newExpense);
    } catch (error) {
      console.error('[API /api/bills/[id]/expenses] Backend Error: Failed to create expense:', error);
      return res.status(500).json({ message: 'Failed to create expense. Internal server error.', error: error.message });
    }
  } else {
    console.warn(`[API /api/bills/[id]/expenses] Method Not Allowed: ${req.method}`);
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}