import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/_studio.scss';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <h1 className="auth-page__title">Welcome Back</h1>
        <p className="auth-page__subtitle">Sign in to save your query attempts</p>

        {error && <div className="auth-page__error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="form-input"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className={`btn btn--primary btn--full btn--lg${loading ? ' btn--loading' : ''}`}
            disabled={loading}
          >
            {!loading && 'Sign In'}
          </button>
        </form>

        <div className="auth-page__footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
