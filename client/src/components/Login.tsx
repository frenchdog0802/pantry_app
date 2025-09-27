import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from './Loading';
interface LoginProps {
  onLoginSuccess: () => void;
}
export function Login({
  onLoginSuccess
}: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const {
    login,
    loading
  } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const success = await login(email, password);
      if (success) {
        onLoginSuccess();
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
    <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">OrganizEat</h1>
      </div>
    </header>
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600">Sign in to your account</h1>
          {/* Hero Section */}
          <div className="my-10 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Cook Smarter, Not Harder
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Discover recipes with ingredients you already have and track your
              cooking journey
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {loading ? <Loading /> : <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="you@example.com" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="••••••••" required />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-orange-600 hover:text-orange-500">
                  Forgot password?
                </a>
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors font-medium">
              Sign in
            </button>
            <div className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <a href="#" className="text-orange-600 hover:text-orange-500">
                Sign up
              </a>
            </div>
          </form>}
        </div>
      </div>
    </div>
  </div>;
}