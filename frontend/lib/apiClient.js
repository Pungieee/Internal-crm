

const API_BASE =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    : 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('crm_token');
}

async function request(method, path, body) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function apiLogin(email, password) {
  return request('POST', '/api/auth/login', { email, password });
}

export async function apiGetTickets() {
  return request('GET', '/api/tickets');
}

export async function apiGetTicket(id) {
  return request('GET', `/api/tickets/${id}`);
}

export async function apiCreateTicket(payload) {
  return request('POST', '/api/tickets', payload);
}

export async function apiUpdateTicket(id, payload) {
  return request('PUT', `/api/tickets/${id}`, payload);
}

export async function apiDeleteTicket(id) {
  return request('DELETE', `/api/tickets/${id}`);
}

export async function apiGetStaffUsers() {
  return request('GET', '/api/users?role=STAFF');
}


