import React, { useState } from 'react';
import { ChefHatIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/authContext';
import { Loading } from './Loading';

interface LoginProps {
  onLoginSuccess: () => void;
  onSignUp: () => void;
}

export function Login({ onSignUp, onLoginSuccess }: LoginProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, googleLogin, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      onLoginSuccess();
    }
  }, [isAuthenticated, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.message || t('auth.invalidCredentials'));
      }
    } catch {
      setError(t('auth.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setIsSubmitting(true);
      try {
        const result = await googleLogin(tokenResponse.access_token);
        if (result.success) {
          onLoginSuccess();
        } else {
          setError(result.message || t('auth.googleFailed'));
        }
      } catch {
        setError(t('auth.googleRetry'));
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      setError(t('auth.googleCancelled'));
    },
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-linen">
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-6">
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-16 lg:py-24">
          <div className="w-full max-w-md animate-fade-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-herb mb-4">
                <ChefHatIcon size={24} className="text-white" />
              </div>
              <h1 className="font-display text-4xl font-semibold text-ink">LarderMind</h1>
              <p className="text-muted mt-2">{t('auth.signInTitle')}</p>
            </div>

            {isSubmitting ? (
              <Loading />
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-sage/60 text-herb-deep p-3 rounded-lg text-sm border border-line">
                      {error}
                    </div>
                  )}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                      {t('auth.email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
                      {t('auth.password')}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-field"
                      placeholder={t('auth.passwordPlaceholder')}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-herb border-line rounded focus:ring-herb"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-muted">
                        {t('auth.rememberMe')}
                      </label>
                    </div>
                    <a href="#" className="text-sm text-herb hover:text-herb-deep">
                      {t('auth.forgotPassword')}
                    </a>
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                    {t('auth.signIn')}
                  </button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-line" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-linen text-muted">{t('common.or')}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin()}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-line rounded-lg bg-surface hover:bg-sage/30 transition-colors text-ink disabled:opacity-50"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                      </g>
                    </svg>
                    {t('auth.signInGoogle')}
                  </button>
                </div>

                <div className="text-center text-sm text-muted mt-8">
                  {t('auth.noAccount')}{' '}
                  <button onClick={onSignUp} className="text-herb hover:text-herb-deep font-medium">
                    {t('auth.signUp')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
