import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { RegisterSchema } from '../schemas/auth.schema';
import { authApi } from '../services/api';
import styles from './Register.module.css';

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
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join Startup Validator Platform</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Email Field */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email.message}</span>
            )}
          </div>

          {/* Name Field */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name (Optional)
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <span className={styles.errorText}>{errors.name.message}</span>
            )}
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              className={`${styles.input} ${
                errors.password ? styles.inputError : ''
              }`}
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <span className={styles.errorText}>
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
