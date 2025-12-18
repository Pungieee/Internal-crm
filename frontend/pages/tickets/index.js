import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import { apiGetTickets, apiCreateTicket } from '../../lib/apiClient';

export default function TicketListPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('crm_user');
    if (!stored) {
      router.replace('/');
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    async function loadTickets() {
      setLoading(true);
      try {
        const data = await apiGetTickets();
        setTickets(data);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:4000', {
      autoConnect: false,
    });

    socket.connect();

    socket.on('ticketAssigned', (ticket) => {
      setNotification(`New ticket assigned: #${ticket.id} ${ticket.title}`);
      setTimeout(() => setNotification(''), 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function handleCreateTicket(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await apiCreateTicket({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
      });
      setTickets((prev) => [created, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setNewPriority('MEDIUM');
    } finally {
      setCreating(false);
    }
  }

  function statusColor(status) {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-100 text-emerald-800';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800';
      case 'RESOLVED':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            CRM Tickets
          </h1>
          {user && (
            <p className="text-sm text-slate-500">
              Logged in as {user.name} ({user.role})
            </p>
          )}
        </div>
        <button
          className="btn-secondary"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem('crm_user');
              window.localStorage.removeItem('crm_token');
            }
            router.replace('/');
          }}
        >
          Logout
        </button>
      </header>

      {notification && (
        <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-900">
          {notification}
        </div>
      )}

      <div className="grid md:grid-cols-[2fr,3fr] gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">
            Create Ticket (Resident)
          </h2>
          <form onSubmit={handleCreateTicket} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                className="input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                className="input min-h-[80px]"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Priority
              </label>
              <select
                className="input"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
              >
                <option value="LOW">Low (72h)</option>
                <option value="MEDIUM">Medium (48h)</option>
                <option value="HIGH">High (24h)</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Ticket'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Tickets</h2>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-slate-500">No tickets yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      #{ticket.id} {ticket.title}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {ticket.description}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Priority: {ticket.priority}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


