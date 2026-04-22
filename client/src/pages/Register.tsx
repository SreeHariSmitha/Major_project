import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { RegisterSchema } from '../schemas/auth.schema';
import { authApi } from '../services/api';

export function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);

      if (response.success) {
        toast.success('Account created. Redirecting to sign in…');
        setTimeout(() => {
          navigate('/login', { state: { email: data.email } });
        }, 1200);
      } else {
        toast.error(response.error?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-white">
      {/* =============== LEFT: BRANDED DARK PANEL =============== */}
      <div className="relative hidden lg:flex flex-col justify-between bg-slate-950 text-white p-12 overflow-hidden">
        {/* Grid + glow background */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, black 30%, transparent 80%)',
          }}
        />
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-indigo-500/25 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[360px] h-[360px] bg-violet-500/20 rounded-full blur-[110px] pointer-events-none" />

        {/* Top: brand */}
        <Link to="/" className="relative flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-bold text-[17px] tracking-tight">Startup Validator</span>
        </Link>

        {/* Middle: pitch + mini product preview */}
        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>6 AI agents working for you</span>
          </div>
          <h2 className="text-4xl font-semibold tracking-tight leading-[1.1] mb-4 text-white">
            Pressure-test your idea before you build it.
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Three structured phases, from raw idea to investor-ready pitch deck —
            with the kill assumption made explicit, not hidden.
          </p>

          {/* Mini proof points */}
          <ul className="mt-8 space-y-3 text-sm">
            {[
              'Market feasibility & CAGR',
              'Real competitor analysis',
              '10-slide pitch deck',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-200">
                <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: fine print */}
        <div className="relative text-xs text-slate-500 font-mono">
          Built with Google ADK · Llama 3.3 · React
        </div>
      </div>

      {/* =============== RIGHT: FORM =============== */}
      <div className="flex flex-col justify-center items-center px-6 sm:px-10 py-12 bg-white">
        {/* Mobile brand (hidden on lg) */}
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-bold text-[17px] tracking-tight text-slate-900">Startup Validator</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-600 text-sm">Start validating your first idea in under a minute.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-lg transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 ${
                    errors.email
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email.message as string}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Name <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  className={`w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border rounded-lg transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 ${
                    errors.name
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                  {...register('name')}
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message as string}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-lg transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 ${
                    errors.password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500">{errors.password.message as string}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 leading-relaxed">
              By creating an account you agree to let your startup ideas be
              respectfully challenged by a sequential AI agent pipeline.
            </p>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
