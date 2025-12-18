import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  apiGetTicket,
  apiUpdateTicket,
  apiDeleteTicket,
  apiGetStaffUsers,
} from '../../lib/apiClient';

export default function TicketDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('OPEN');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [staffUsers, setStaffUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('crm_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const data = await apiGetTicket(id);
        setTicket(data);
        setStatus(data.status);
        setPriority(data.priority);
        setDescription(data.description || '');
        setAssignedStaffId(data.assignedStaffId || '');
      } catch (err) {
        setError('Ticket not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    async function loadStaff() {
      if (!user || user.role !== 'ADMIN') return;
      try {
        const staff = await apiGetStaffUsers();
        setStaffUsers(staff);
      } catch {
      }
    }
    loadStaff();
  }, [user]);

  async function handleUpdate(e) {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {};

      if (!user) return;

      // - RESIDENT: can update description
      // - STAFF: can update status
      // - ADMIN: can update status, priority, description, assignedStaffId
      if (user.role === 'RESIDENT') {
        payload.description = description;
      } else if (user.role === 'STAFF') {
        payload.status = status;
      } else if (user.role === 'ADMIN') {
        payload.status = status;
        payload.priority = priority;
        payload.description = description;
        payload.assignedStaffId = assignedStaffId ? Number(assignedStaffId) : null;
      }

      const updated = await apiUpdateTicket(id, payload);
      setTicket(updated);
      setStatus(updated.status);
      setPriority(updated.priority);
      setDescription(updated.description || '');
      setAssignedStaffId(updated.assignedStaffId || '');
    } catch (err) {
      setError('Failed to update');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this ticket?')) return;
    try {
      await apiDeleteTicket(id);
      router.push('/tickets');
    } catch (err) {
      setError('Failed to delete');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Loading ticket...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        {error || 'Ticket not found'}
      </div>
    );
  }

  const slaDate = ticket.slaDeadline ? new Date(ticket.slaDeadline) : null;

  return (
    <div className="min-h-screen px-4 py-6 max-w-3xl mx-auto">
      <button
        className="mb-4 text-sm text-blue-600 hover:underline"
        onClick={() => router.back()}
      >
        ← Back
      </button>

      <div className="card">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              #{ticket.id} {ticket.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Priority: {ticket.priority}
            </p>
            {slaDate && (
              <p className="text-xs text-slate-500">
                SLA Deadline: {slaDate.toLocaleString()}
              </p>
            )}
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
            {ticket.status}
          </span>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              className="input min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!user}
            />
            {user && user.role === 'RESIDENT' && (
              <p className="mt-1 text-xs text-slate-500">
                Resident สามารถแก้ไขคำอธิบายปัญหาได้
              </p>
            )}
          </div>

          {user && (user.role === 'STAFF' || user.role === 'ADMIN') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status ({user.role === 'STAFF' ? 'Staff' : 'Admin'} can update)
              </label>
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>
          )}

          {user && user.role === 'ADMIN' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Priority (Admin only)
                </label>
                <select
                  className="input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="LOW">LOW (72h)</option>
                  <option value="MEDIUM">MEDIUM (48h)</option>
                  <option value="HIGH">HIGH (24h)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assign Staff (Admin only)
                </label>
                <select
                  className="input"
                  value={assignedStaffId ?? ''}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {staffUsers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="btn-primary"
              disabled={updating}
            >
              {updating ? 'Saving...' : 'Save'}
            </button>

            {user && user.role === 'ADMIN' && (
              <button
                type="button"
                className="btn-secondary text-red-600 border border-red-200 hover:bg-red-50"
                onClick={handleDelete}
              >
                Delete Ticket
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}


