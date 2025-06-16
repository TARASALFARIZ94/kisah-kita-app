// pages/api/bills/[id].js

import db from '@/lib/db'; // Sesuaikan path jika berbeda

export default async function handler(req, res) {
  const { id: billId } = req.query; // Ini akan menjadi UUID string dari URL

  console.log(`[API /api/bills/[id]] Received request. Bill ID: ${billId}, Method: ${req.method}`);

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.warn(`[API /api/bills/[id]] No authorization token provided.`);
    return res.status(401).json({ message: 'Authorization token missing.' });
  }
  // TODO: Verifikasi token dan pastikan user berhak mengakses bill ini
  // const userId = verifyAuthToken(token);
  // if (!userId) { return res.status(401).json({ message: 'Invalid or expired token.' }); }


  // Validasi basic format UUID (penting untuk dynamic routes)
  if (typeof billId !== 'string' || !billId.match(/^[0-9a-fA-F-]{36}$/)) {
    console.error('[API /api/bills/[id]] Invalid billId format received:', billId);
    return res.status(400).json({ message: 'Invalid Bill ID format. Expected a UUID string.' });
  }

  if (req.method === 'GET') {
    try {
      const bill = await db.bill.findUnique({
        where: { id: billId }, // Gunakan billId langsung (string UUID)
        include: { expenses: true } // Pastikan expenses ikut terambil
      });

      if (!bill) {
        console.warn(`[API /api/bills/[id]] Bill with ID ${billId} not found.`);
        return res.status(404).json({ message: 'Bill not found.' }); // Pastikan 404 mengembalikan JSON
      }

      // TODO: Tambahkan pengecekan kepemilikan bill jika Anda memiliki creatorId di model Bill
      // if (bill.creatorId !== userId) {
      //    return res.status(403).json({ message: 'Forbidden: You do not have access to this bill.' });
      // }

      console.log(`[API /api/bills/[id]] Successfully fetched bill details for ID: ${billId}`);
      return res.status(200).json(bill); // Pastikan ini mengembalikan JSON
    } catch (error) {
      console.error(`[API /api/bills/[id]] Backend Error: Failed to fetch bill ${billId}:`, error);
      return res.status(500).json({ message: 'Failed to fetch bill details.', error: error.message });
    }
  } else {
    console.warn(`[API /api/bills/[id]] Method Not Allowed: ${req.method}`);
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}