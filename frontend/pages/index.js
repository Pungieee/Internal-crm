import { useRouter } from 'next/router';
import { useState } from 'react';
import { apiLogin } from '../lib/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('resident@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiLogin(email, password);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('crm_user', JSON.stringify(result.user));
        window.localStorage.setItem('crm_token', result.token);
      }
      router.push('/tickets');
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900">
          Internal CRM Login
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          เลือก role เพื่อจำลองการใช้งานระบบ (Resident / Staff / Admin)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          Demo accounts:
          <br />
          - admin@example.com / password123 (ADMIN)
          <br />
          - staff@example.com / password123 (STAFF)
          <br />
          - resident@example.com / password123 (RESIDENT)
        </p>
      </div>
    </div>
  );
}


