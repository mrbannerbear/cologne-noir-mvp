'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Redirect to login or home
      router.push('/login?registered=true');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-2 border-foreground bg-background">
      {/* Header */}
      <div className="border-b-2 border-foreground p-6 text-center">
        <Link href="/" className="font-serif text-2xl font-bold uppercase tracking-widest">
          Cologne Noir
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">Create your account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        {error && (
          <div className="border-2 border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div>
          <label className="text-xs font-bold uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full border-2 border-foreground bg-foreground py-3 font-medium uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Footer */}
      <div className="border-t-2 border-foreground p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
