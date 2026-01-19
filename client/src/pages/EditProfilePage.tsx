import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/v1/auth/profile`, {
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
    <div className="min-h-screen w-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Edit Profile</h1>
              <p className="text-xs text-slate-500">Update your account information</p>
            </div>
            <Link
              to="/profile"
              className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className={`input ${errors.name ? 'input-error' : ''}`}
                {...register('name', {
                  maxLength: {
                    value: 100,
                    message: 'Name cannot exceed 100 characters',
                  },
                })}
                disabled={isLoading}
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-sm text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Info box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-700">
                Email address cannot be changed. If you need to update your email, please contact support.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
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
      <footer className="border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">&copy; 2024 Startup Validator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default EditProfilePage;
