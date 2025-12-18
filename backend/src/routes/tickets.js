import express from 'express';
import { prisma } from '../prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { calculateSlaDeadline, applySlaStatus } from '../utils/sla.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('RESIDENT', 'ADMIN'), async (req, res) => {
  const { title, description, priority = 'MEDIUM' } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    const slaDeadline = calculateSlaDeadline(priority);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        slaDeadline,
        createdById: req.user.id,
      },
    });

    return res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create ticket' });
  }
});

// Get tickets according to role:
// - ADMIN: see all
// - STAFF: see tickets assigned to them
// - RESIDENT: see tickets they created
router.get('/', async (req, res) => {
  try {
    let where = {};

    if (req.user.role === 'STAFF') {
      where = { assignedStaffId: req.user.id };
    } else if (req.user.role === 'RESIDENT') {
      where = { createdById: req.user.id };
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const updatedTickets = await Promise.all(
      tickets.map((t) => applySlaStatus(prisma, t))
    );

    return res.json(updatedTickets);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.user.role === 'STAFF' && ticket.assignedStaffId !== req.user.id) {
      return res.status(403).json({ message: 'Not your ticket' });
    }
    if (req.user.role === 'RESIDENT' && ticket.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Not your ticket' });
    }

    const updated = await applySlaStatus(prisma, ticket);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch ticket' });
  }
});

// Update ticket:
// - ADMIN: can assign staff and change status/priority
// - STAFF: can update status of tickets assigned to them
// - RESIDENT: can only update description of their tickets (simple rule)
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { status, priority, description, assignedStaffId } = req.body;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access
    if (req.user.role === 'STAFF' && ticket.assignedStaffId !== req.user.id) {
      return res.status(403).json({ message: 'Not your ticket' });
    }
    if (req.user.role === 'RESIDENT' && ticket.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Not your ticket' });
    }

    const data = {};

    if (req.user.role === 'RESIDENT') {
      if (description) data.description = description;
    } else if (req.user.role === 'STAFF') {
      if (status) data.status = status;
    } else if (req.user.role === 'ADMIN') {
      if (status) data.status = status;
      if (priority) {
        data.priority = priority;
        data.slaDeadline = calculateSlaDeadline(priority);
      }
      if (typeof assignedStaffId !== 'undefined') {
        data.assignedStaffId = assignedStaffId;
      }
      if (description) data.description = description;
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data,
    });

    const finalTicket = await applySlaStatus(prisma, updated);

    if (req.app.get('io') && typeof assignedStaffId !== 'undefined') {
      req.app.get('io').emit('ticketAssigned', finalTicket);
    }

    return res.json(finalTicket);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update ticket' });
  }
});

// Delete ticket
router.delete('/:id', authorize('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.ticket.delete({ where: { id } });
    return res.json({ message: 'Ticket deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete ticket' });
  }
});

export default router;


