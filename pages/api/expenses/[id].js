// pages/api/expenses/[id].js

import db from '@/lib/db'; // Sesuaikan path jika berbeda

export default async function handler(req, res) {
  const { id: expenseId } = req.query; // Ini akan menjadi UUID string dari URL

  console.log(`[API /api/expenses/[id]] Received ${req.method} request for Expense ID: ${expenseId}`);
  console.log('[API /api/expenses/[id]] Request Body (for PUT):', req.body);

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.warn(`[API /api/expenses/[id]] No authorization token provided.`);
    return res.status(401).json({ message: 'Authorization token missing.' });
  }
  // TODO: Verifikasi token dan pastikan user berhak mengelola expense ini

  // Validasi basic format UUID untuk expenseId
  if (typeof expenseId !== 'string' || !expenseId.match(/^[0-9a-fA-F-]{36}$/)) {
    console.error('[API /api/expenses/[id]] Invalid expenseId format received:', expenseId);
    return res.status(400).json({ message: 'Invalid Expense ID format. Expected a UUID string.' });
  }

  if (req.method === 'PUT') {
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
      const existingExpense = await db.expense.findUnique({
        where: { id: expenseId },
        include: { bill: true }
      });

      if (!existingExpense) {
        console.warn(`[API /api/expenses/[id]] Expense with ID ${expenseId} not found for update.`);
        return res.status(404).json({ message: 'Expense not found with the provided ID.' });
      }

      const updatedExpense = await db.expense.update({
        where: { id: expenseId },
        data: {
          description,
          quantity,    // <-- Update quantity
          totalAmount, // <-- Update totalAmount
          paidBy,
          splitAmong,
        },
      });
      console.log(`[API /api/expenses/[id]] Expense ${expenseId} updated successfully.`);
      return res.status(200).json(updatedExpense);
    } catch (error) {
      console.error(`[API /api/expenses/[id]] Backend Error: Failed to update expense ${expenseId}:`, error);
      if (error.code === 'P2025') {
         return res.status(404).json({ message: 'Expense not found with the provided ID.' });
      }
      return res.status(500).json({ message: 'Failed to update expense.', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    // ... logic for DELETE method (tidak ada perubahan di sini) ...
    try {
        const existingExpense = await db.expense.findUnique({
            where: { id: expenseId },
            include: { bill: true }
        });

        if (!existingExpense) {
            console.warn(`[API /api/expenses/[id]] Expense ${expenseId} not found for deletion.`);
            return res.status(404).json({ message: 'Expense not found for deletion.' });
        }

        await db.expense.delete({
            where: { id: expenseId },
        });
        console.log(`[API /api/expenses/[id]] Expense ${expenseId} deleted successfully.`);
        return res.status(204).end();
    } catch (error) {
        console.error(`[API /api/expenses/[id]] Backend Error: Failed to delete expense ${expenseId}:`, error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Expense not found for deletion.' });
        }
        return res.status(500).json({ message: 'Failed to delete expense.', details: error.message });
    }
  } else {
    console.warn(`[API /api/expenses/[id]] Method Not Allowed: ${req.method}`);
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}