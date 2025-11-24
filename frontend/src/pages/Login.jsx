import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { googleAuth } from '../api/authApi';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Google Credential Token:', credentialResponse.credential);
      setError('');
      setLoading(true);
      
      // Send credential to backend
      const authResponse = await googleAuth(credentialResponse.credential);
      console.log('Backend Response:', authResponse.data);
      
      const { token, user: userData } = authResponse.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed');
      console.error('Google auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log('Google Login Failed');
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#f4f2fb] flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6">
      <div className="w-full max-w-md rounded-2xl sm:rounded-[32px] bg-white p-4 sm:p-6 shadow-card">
        <div className="text-center">
          <p className="font-display text-lg sm:text-xl uppercase tracking-[0.2em] sm:tracking-[0.3em] text-charcoal">
            <span>6</span>
            <span className="text-[#ff0000]">XO BAGS</span>
          </p>
          <h1 className="mt-2 font-display text-xl sm:text-2xl text-charcoal">Welcome Back</h1>
          <p className="mt-1 text-xs text-gray-500">Sign in to continue discovering timeless carryalls.</p>
        </div>

        <form className="mt-4 sm:mt-5 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-xs sm:text-sm text-gray-500">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 sm:mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base"
              required
            />
          </label>
          <label className="block text-xs sm:text-sm text-gray-500">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1.5 sm:mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base"
              required
            />
          </label>
          {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-charcoal py-2.5 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-4 text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-400">
          <span className="flex-1 border-t border-gray-200" />
          OR
          <span className="flex-1 border-t border-gray-200" />
        </div>

        <div className="mt-3 sm:mt-4 min-h-[42px] flex items-center justify-center w-full">
          <div className="w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
            />
          </div>
        </div>

        <p className="mt-3 sm:mt-4 text-center text-xs text-gray-500">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-charcoal underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
