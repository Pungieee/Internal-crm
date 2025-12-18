import express from 'express';
import { prisma } from '../prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Admin can list users, optionally filtered by role.
// Example: GET /api/users?role=STAFF
router.get('/', authorize('ADMIN'), async (req, res) => {
  const { role } = req.query;

  try {
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
});

export default router;


