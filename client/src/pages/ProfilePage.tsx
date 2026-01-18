import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    // Profile data is already available from AuthContext
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
      <div className={styles.container}>
        <div className={styles.backgroundElements}>
          <div className={styles.orb1}></div>
          <div className={styles.orb2}></div>
          <div className={styles.orb3}></div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading profile...</p>
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
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/dashboard" className={styles.dashboardLink}>
            Back to Dashboard
          </Link>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className={styles.main}>
        {/* Profile card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>{profileData.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div className={styles.profileInfo}>
              <h2>{profileData.name || 'Not set'}</h2>
              <p className={styles.email}>{profileData.email}</p>
            </div>
          </div>

          {/* Profile details */}
          <div className={styles.profileDetails}>
            <div className={styles.detailItem}>
              <label>Full Name</label>
              <p className={styles.detailValue}>{profileData.name || 'Not provided'}</p>
            </div>

            <div className={styles.detailItem}>
              <label>Email Address</label>
              <p className={styles.detailValue}>{profileData.email}</p>
            </div>

            <div className={styles.detailItem}>
              <label>Member Since</label>
              <p className={styles.detailValue}>{formattedDate}</p>
            </div>

            <div className={styles.detailItem}>
              <label>Account ID</label>
              <p className={styles.detailValue} style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                {profileData._id}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.actions}>
            <Link to="/profile/edit" className={styles.editButton}>
              Edit Profile
            </Link>
            <Link to="/dashboard" className={styles.backButton}>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Info box */}
        <div className={styles.infoBox}>
          <h3>Account Information</h3>
          <p>
            You can update your profile information at any time. Your email address is used for login and account recovery.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2024 Startup Validator. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ProfilePage;
