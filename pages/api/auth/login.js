// pages/api/auth/login.js
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    // DEBUG: Log request data
    console.log('=== LOGIN DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Email:', email);
    console.log('Password length:', password?.length);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    // 1. Validasi Input Dasar
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 2. Cari User Berdasarkan Email
    console.log('🔍 Searching for user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      },
    });

    console.log('👤 User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User details:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      });
    }

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. Bandingkan Password
    console.log('🔐 Comparing passwords...');
    console.log('Input password:', password);
    console.log('Stored password hash:', user.password);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 4. Generate JSON Web Token (JWT)
    console.log('🎫 Generating JWT token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Siapkan Data User yang Akan Dikirim ke Frontend (tanpa password)
    const { password: userPassword, ...userWithoutPassword } = user;

    console.log('✅ Login successful for user:', user.email);
    console.log('Token generated:', token.substring(0, 20) + '...');

    // 6. Kirim Respons dengan Token
    return res.status(200).json({ 
      message: 'Login successful.', 
      user: userWithoutPassword, 
      token 
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Something went wrong during login.' });
  }
}