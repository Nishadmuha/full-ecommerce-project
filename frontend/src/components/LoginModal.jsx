import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../api/authApi';

export default function LoginModal({
  open,
  onClose,
  onSubmit,
  onApple,
  onSwitchToRegister,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit?.({ email, password, remember });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
      onClose();
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3 sm:px-4 py-4">
      <div className="w-full max-w-md rounded-2xl sm:rounded-[32px] bg-white p-4 sm:p-6 shadow-2xl">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gray-100 text-gray-500 hover:text-charcoal text-base sm:text-lg touch-manipulation"
            aria-label="Close login form"
          >
            ×
          </button>
        </div>

        <div className="text-center">
          <p className="font-display text-lg sm:text-xl uppercase tracking-[0.2em] sm:tracking-[0.3em] text-charcoal">
            <span>6</span>
            <span className="text-[#ff0000]">XO BAGS</span>
          </p>
          <h2 className="mt-2 font-display text-xl sm:text-2xl text-charcoal">Welcome Back</h2>
        </div>

        <form className="mt-4 sm:mt-5 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-xs sm:text-sm text-gray-500">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 sm:mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base"
              required
            />
          </label>

          <label className="block text-xs sm:text-sm text-gray-500">
            Password
            <div className="mt-1.5 sm:mt-2 flex items-center gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base"
                required
              />
              <button type="button" className="text-xs text-gray-500 underline whitespace-nowrap touch-manipulation">
                Forgot?
              </button>
            </div>
          </label>

          <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-charcoal"
            />
            Remember me
          </label>

          {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-charcoal py-2.5 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-wide text-white touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
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

        <button
          type="button"
          onClick={onApple}
          className="mt-2 flex w-full items-center justify-center gap-2 sm:gap-3 rounded-full border border-gray-200 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600 hover:border-charcoal hover:text-charcoal touch-manipulation"
        >
          <span aria-hidden></span>
          <span className="hidden sm:inline">Continue with Apple</span>
          <span className="sm:hidden">Apple</span>
        </button>

        <p className="mt-3 sm:mt-4 text-center text-xs text-gray-500">
          New to 6XO?
          <button type="button" onClick={onSwitchToRegister} className="ml-2 font-semibold text-charcoal underline touch-manipulation">
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
