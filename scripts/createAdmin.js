// scripts/createAdmin.js
// Jalankan dengan: node scripts/createAdmin.js
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminData = {
      name: 'Administrator',
      email: 'admin@example.com',
      password: 'admin123', // Ganti dengan password yang aman
      role: 'ADMIN'
    };

    console.log('🔐 Hashing password...');
    const hashedPassword = await hash(adminData.password, 10);

    console.log('👤 Creating admin user...');
    const admin = await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin details:');
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Password:', adminData.password);
    console.log('   Created:', admin.createdAt);

    console.log('\n🔑 You can now login with:');
    console.log('   Email:', admin.email);
    console.log('   Password:', adminData.password);

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  User with this email already exists!');
    } else {
      console.error('❌ Error creating admin:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();