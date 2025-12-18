

let MOCK_TICKETS = [
  {
    id: 1,
    title: 'น้ำไม่ไหลที่ห้อง 501',
    description: 'น้ำไม่ไหลมา 2 ชั่วโมงแล้ว',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdByName: 'Resident User',
  },
  {
    id: 2,
    title: 'หลอดไฟหน้าห้องเสีย',
    description: 'ไฟกระพริบตลอดเวลา',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
    slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdByName: 'Resident User',
  },
];

let NEXT_ID = 3;

export async function mockLogin({ email, role }) {
  // Very naive mock: just return a fake token and user object
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'mock-jwt-token',
        user: {
          id: 1,
          name: email.split('@')[0] || 'Demo User',
          email,
          role,
        },
      });
    }, 400);
  });
}

export async function mockGetTickets() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_TICKETS]);
    }, 400);
  });
}

export async function mockGetTicket(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ticket = MOCK_TICKETS.find((t) => t.id === Number(id));
      if (!ticket) {
        reject(new Error('Ticket not found'));
      } else {
        resolve({ ...ticket });
      }
    }, 300);
  });
}

export async function mockUpdateTicket(id, updates) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = MOCK_TICKETS.findIndex((t) => t.id === Number(id));
      if (index === -1) return reject(new Error('Ticket not found'));

      MOCK_TICKETS[index] = {
        ...MOCK_TICKETS[index],
        ...updates,
      };

      resolve({ ...MOCK_TICKETS[index] });
    }, 300);
  });
}

export async function mockCreateTicket(payload) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ticket = {
        id: NEXT_ID++,
        createdAt: new Date().toISOString(),
        status: 'OPEN',
        slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        ...payload,
      };
      MOCK_TICKETS.unshift(ticket);
      resolve({ ...ticket });
    }, 300);
  });
}


