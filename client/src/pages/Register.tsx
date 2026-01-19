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
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { state: { email: data.email } });
        }, 1500);
      } else {
        const errorMessage =
          response.error?.message || 'Registration failed';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-0 left-1/4 animate-pulse" />
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-0 right-1/4 animate-pulse delay-700" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500">Join Startup Validator Platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`input ${errors.email ? 'input-error' : ''}`}
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500 font-medium">{errors.email.message as string}</p>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              className={`input ${errors.name ? 'input-error' : ''}`}
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500 font-medium">{errors.name.message as string}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              className={`input ${errors.password ? 'input-error' : ''}`}
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500 font-medium">{errors.password.message as string}</p>
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
