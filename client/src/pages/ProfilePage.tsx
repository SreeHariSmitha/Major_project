import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (user) setProfileData(user);
  }, [user]);

  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (!profileData) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(profileData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const initial = (profileData.name?.charAt(0) || profileData.email?.charAt(0) || 'U').toUpperCase();

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="font-bold text-[17px] tracking-tight text-slate-900">
                Startup Validator
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-1">Profile</h1>
          <p className="text-sm text-slate-500">Your account information.</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          {/* Banner with avatar */}
          <div className="relative h-32 bg-slate-950 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]" />
            <div className="absolute top-0 right-10 w-48 h-48 bg-violet-500/25 rounded-full blur-[80px]" />
          </div>

          {/* Avatar overlapping banner */}
          <div className="px-6 pb-6 -mt-10 relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-semibold shadow-lg ring-4 ring-white">
              {initial}
            </div>

            <div className="mt-4 mb-6">
              <h2 className="text-xl font-semibold text-slate-900">{profileData.name || 'No name set'}</h2>
              <p className="text-sm text-slate-500">{profileData.email}</p>
            </div>

            {/* Details grid */}
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5 pb-6 border-b border-slate-100">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full name
                </dt>
                <dd className="text-sm text-slate-900">
                  {profileData.name || <span className="text-slate-400 italic">Not provided</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email
                </dt>
                <dd className="text-sm text-slate-900">{profileData.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Member since
                </dt>
                <dd className="text-sm text-slate-900">{formattedDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Account ID
                </dt>
                <dd className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded inline-block">
                  {profileData._id}
                </dd>
              </div>
            </dl>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-6">
              <Link
                to="/profile/edit"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Edit profile
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 hover:text-slate-900 transition-colors"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Account info</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                You can update your name any time. Your email address is used for login and
                can't be changed — contact support if you need to migrate accounts.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
