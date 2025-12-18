// SLA helper functions for tickets
// HIGH   = 24 hours
// MEDIUM = 48 hours
// LOW    = 72 hours
//
// The idea:
// - When a ticket is created (or its priority changes), we calculate an slaDeadline.
// - Whenever we read or update a ticket, we can check if `now > slaDeadline`.
//   If so, and the ticket is not yet RESOLVED, we mark it as OVERDUE.

import { TicketStatus, TicketPriority } from '@prisma/client';

export function calculateSlaDeadline(priority) {
  const now = new Date();
  let hoursToAdd = 72; // default LOW

  if (priority === TicketPriority.HIGH) {
    hoursToAdd = 24;
  } else if (priority === TicketPriority.MEDIUM) {
    hoursToAdd = 48;
  } else if (priority === TicketPriority.LOW) {
    hoursToAdd = 72;
  }

  const deadline = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  return deadline;
}

// Check and update SLA status.
// - If ticket is not RESOLVED and `now > slaDeadline`, we update it to OVERDUE.
// - Otherwise we just return the existing ticket.
export async function applySlaStatus(prisma, ticket) {
  if (!ticket) return null;

  if (
    ticket.status !== TicketStatus.RESOLVED &&
    ticket.status !== TicketStatus.OVERDUE &&
    ticket.slaDeadline &&
    new Date() > ticket.slaDeadline
  ) {
    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.OVERDUE },
    });
    return updated;
  }

  return ticket;
}


