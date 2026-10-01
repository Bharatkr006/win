import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email to confirm your account.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tighter">Winter Arc</h1>
          <p className="mt-1 text-sm text-green-gray">
            92 days · Oct 1 – Dec 31, 2026
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border-soft bg-surface p-6 space-y-4 shadow-sm"
        >
          <h2 className="text-lg font-semibold tracking-tight">
            {isSignUp ? 'Create account' : 'Sign in'}
          </h2>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-green-gray">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border-soft px-3 py-2.5 text-sm outline-none transition-all duration-150 focus:border-green-mid focus:shadow-[0_0_0_3px_rgba(46,133,72,0.08)]"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-green-gray">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border-soft px-3 py-2.5 text-sm outline-none transition-all duration-150 focus:border-green-mid focus:shadow-[0_0_0_3px_rgba(46,133,72,0.08)]"
              placeholder="••••••••"
            />
          </div>

          {/* Error / success messages */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg bg-green-pale px-3 py-2 text-sm text-green-mid">
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-mid px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-green-deep hover:shadow-sm disabled:opacity-50 active:scale-[0.98]"
          >
            {loading
              ? 'Please wait…'
              : isSignUp
                ? 'Sign up'
                : 'Sign in'}
          </button>

          {/* Toggle mode */}
          <p className="text-center text-sm text-green-gray">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="font-medium text-green-mid hover:text-green-deep hover:underline transition-colors duration-150"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
