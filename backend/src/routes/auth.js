import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Simple login route using email + password.
// NOTE: For demo/resume purposes. In production you should enforce stronger rules & HTTPS.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

// Simple seed endpoint to create demo users quickly (ADMIN only in real life).
// For resume demo you can call this once manually via Postman.
router.post('/seed-demo-users', async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    const [admin, staff, resident] = await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
          name: 'Admin User',
          email: 'admin@example.com',
          password: passwordHash,
          role: 'ADMIN',
        },
      }),
      prisma.user.upsert({
        where: { email: 'staff@example.com' },
        update: {},
        create: {
          name: 'Staff User',
          email: 'staff@example.com',
          password: passwordHash,
          role: 'STAFF',
        },
      }),
      prisma.user.upsert({
        where: { email: 'resident@example.com' },
        update: {},
        create: {
          name: 'Resident User',
          email: 'resident@example.com',
          password: passwordHash,
          role: 'RESIDENT',
        },
      }),
    ]);

    return res.json({ admin, staff, resident });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to seed demo users' });
  }
});

export default router;


