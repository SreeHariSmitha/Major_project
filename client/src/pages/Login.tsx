import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { LoginSchema } from '../schemas/auth.schema';
import { useAuth } from '../hooks/useAuth';

interface LoginFormData {
  email: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-32 -right-32 animate-pulse delay-1000" />
        <div className="absolute w-64 h-64 bg-white/5 rounded-full blur-2xl top-1/2 right-1/4 animate-pulse delay-500" />
      </div>

      {/* Main content - split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen relative z-10">
        {/* Left side - Login form */}
        <div className="flex flex-col justify-center px-8 py-12 lg:px-16 bg-white animate-slide-up">
          {/* Header */}
          <div className="mb-8">
            <div className="text-4xl mb-4">🚀</div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-500">Sign in to your Startup Validator account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`input pl-11 ${errors.email ? 'input-error' : ''}`}
                  {...register('email')}
                  disabled={isLoading}
                  autoComplete="email"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className={`input pl-11 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full py-3 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-slate-500">New to Startup Validator?</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create one now
            </Link>
          </p>
        </div>

        {/* Right side - Features */}
        <div className="hidden lg:flex flex-col justify-center gap-6 p-12 animate-fade-in">
          {[
            { icon: '✨', title: 'Validate Ideas', desc: 'Test your startup hypotheses with AI' },
            { icon: '📊', title: 'Track Progress', desc: 'Monitor your validation journey' },
            { icon: '🎯', title: 'Build Success', desc: 'Launch with confidence' },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-white hover:bg-white/15 hover:translate-x-2 transition-all duration-300"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
              <p className="text-white/80 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;
