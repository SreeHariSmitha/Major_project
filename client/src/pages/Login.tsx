import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { LoginSchema } from '../schemas/auth.schema';
import { useAuth } from '../hooks/useAuth';
import styles from './Login.module.css';

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
    <div className={styles.container}>
      {/* Animated background elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              <div className={styles.logo}>🚀</div>
            </div>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to your Startup Validator account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* Email Field */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  {...register('email')}
                  disabled={isLoading}
                  autoComplete="email"
                />
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {errors.email && (
                <span className={styles.errorText}>{errors.email.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  {...register('password')}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              {errors.password && (
                <span className={styles.errorText}>{errors.password.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span>New to Startup Validator?</span>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className={styles.link}>
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Side features */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>✨</div>
            <h3 className={styles.featureTitle}>Validate Ideas</h3>
            <p className={styles.featureDesc}>Test your startup hypotheses</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>Track Progress</h3>
            <p className={styles.featureDesc}>Monitor your validation journey</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🎯</div>
            <h3 className={styles.featureTitle}>Build Success</h3>
            <p className={styles.featureDesc}>Launch with confidence</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
