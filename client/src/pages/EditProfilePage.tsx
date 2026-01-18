import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import styles from './EditProfilePage.module.css';

interface EditProfileFormData {
  name: string;
}

export function EditProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EditProfileFormData>({
    defaultValues: {
      name: user?.name || '',
    },
  });

  useEffect(() => {
    if (user?.name) {
      setValue('name', user.name);
    }
  }, [user, setValue]);

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name: data.name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update profile');
      }

      // Update user in context
      setUser(result.data);

      toast.success('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      console.error('Profile update error:', error);
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

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Edit Profile</h1>
          <p>Update your account information</p>
        </div>
      </header>

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* Name Field */}
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Full Name
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  {...register('name', {
                    maxLength: {
                      value: 100,
                      message: 'Name cannot exceed 100 characters',
                    },
                  })}
                  disabled={isLoading}
                  autoComplete="name"
                />
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
            </div>

            {/* Info box */}
            <div className={styles.infoBox}>
              <p>Email address cannot be changed. If you need to update your email, please contact support.</p>
            </div>

            {/* Action buttons */}
            <div className={styles.actions}>
              <button type="submit" className={styles.saveButton} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => navigate('/profile')}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2024 Startup Validator. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default EditProfilePage;
