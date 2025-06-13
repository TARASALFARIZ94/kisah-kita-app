// lib/auth.js
import jwt from 'jsonwebtoken';

// Fungsi untuk memverifikasi token JWT dari header Authorization
// Untuk Pages Router, kita menerima objek req langsung
export function verifyToken(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return null; // Tidak ada token
  }

  try {
    // Pastikan JWT_SECRET tidak undefined
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in .env');
      return null;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Asumsi payload JWT Anda berisi userId, email, dan role
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Fungsi helper untuk middleware otorisasi API Route
// Ini akan digunakan di dalam API Route Anda
export function authorizeApi(req, res, allowedRoles) {
  const authUser = verifyToken(req);

  if (!authUser) {
    res.status(401).json({ message: 'Unauthorized: No token provided or token invalid.' });
    return false; // Mengindikasikan otorisasi gagal
  }

  if (!allowedRoles.includes(authUser.role)) {
    res.status(403).json({ message: 'Forbidden: Insufficient role.' });
    return false; // Mengindikasikan otorisasi gagal
  }

  req.user = authUser; // Menambahkan user terautentikasi ke objek request
  return true; // Mengindikasikan otorisasi sukses
}