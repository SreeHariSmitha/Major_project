import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (!profileData) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(profileData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-lg font-bold text-slate-900">My Profile</h1>
              <p className="text-xs text-slate-500">Manage your account information</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          {/* Profile header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profileData.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-white">
                <h2 className="text-xl font-semibold">{profileData.name || 'Not set'}</h2>
                <p className="text-white/80">{profileData.email}</p>
              </div>
            </div>
          </div>

          {/* Profile details */}
          <div className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                <p className="text-slate-900 font-medium">{profileData.name || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                <p className="text-slate-900 font-medium">{profileData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Member Since</label>
                <p className="text-slate-900 font-medium">{formattedDate}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Account ID</label>
                <p className="text-slate-600 text-sm font-mono bg-slate-50 px-2 py-1 rounded inline-block">
                  {profileData._id}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
              <Link to="/profile/edit" className="btn btn-primary">
                Edit Profile
              </Link>
              <Link to="/dashboard" className="btn btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
          <h3 className="font-semibold text-indigo-900 mb-2">Account Information</h3>
          <p className="text-indigo-700 text-sm">
            You can update your profile information at any time. Your email address is used for login and account recovery.
          </p>
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

export default ProfilePage;
