import db from '@/lib/db';

export default async function handler(req, res) {
  // GET all users
  if (req.method === 'GET') {
    try {
      const users = await db.user.findMany();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // CREATE user
  if (req.method === 'POST') {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newUser = await db.user.create({
        data: {
          name,
          email,
          password,
          role: role || 'USER',
        },
      });
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // UPDATE user
  if (req.method === 'PUT') {
    const { id, name, email, password, role } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const updatedUser = await db.user.update({
        where: { id: Number(id) },
        data: {
          name,
          email,
          password,
          role,
        },
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // DELETE user
  if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      await db.user.delete({
        where: { id: Number(id) },
      });
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}