import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { googleAuth } from '../api/authApi';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
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
        <div className="text-center space-y-1">
          <p className="font-display text-lg sm:text-xl uppercase tracking-[0.2em] sm:tracking-[0.3em] text-charcoal">
            <span>6</span>
            <span className="text-[#ff0000]">XO BAGS</span>
          </p>
          <h1 className="font-display text-xl sm:text-2xl text-charcoal">Create your 6XO Account</h1>
          <p className="text-xs text-gray-500">Register to explore our exclusive collection of luxury bags.</p>
        </div>

        <form className="mt-4 sm:mt-5 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-xs sm:text-sm text-gray-500">
            Full Name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 sm:mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base"
              required
            />
          </label>
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
          <label className="block text-xs sm:text-sm text-gray-500">
            Confirm Password
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-4 text-xs uppercase tracking-[0.2em] sm:tracking-[0.4em] text-gray-400">
          <span className="flex-1 border-t border-gray-200" />
          <span className="hidden sm:inline">OR CONTINUE WITH</span>
          <span className="sm:hidden">OR</span>
          <span className="flex-1 border-t border-gray-200" />
        </div>

        <div className="mt-3 sm:mt-4 min-h-[42px] flex items-center justify-center w-full google-auth-wrapper">
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signup_with"
              shape="rectangular"
              theme="outline"
              size="large"
            />
          </div>
        </div>

        <p className="mt-3 sm:mt-4 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-charcoal underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
