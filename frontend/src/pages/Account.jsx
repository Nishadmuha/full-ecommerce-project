// frontend/src/pages/Account.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, deleteAccount } from '../api/userApi';

const sections = ['Profile', 'Order History', 'Shipping Addresses', 'Settings', 'Logout'];

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        profileImage: response.data.profileImage || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await updateProfile(formData);
      setProfile(response.data);
      setEditing(false);
      alert('Profile updated successfully!');
      // Update user in context if needed
      if (response.data) {
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      profileImage: profile?.profileImage || '',
    });
    setEditing(false);
  };

  const handleSectionClick = (section) => {
    if (section === 'Order History') {
      navigate('/orders');
    } else if (section === 'Shipping Addresses') {
      navigate('/shipping-address');
    } else if (section === 'Settings') {
      setShowSettings(true);
    } else if (section === 'Logout') {
      logout();
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await deleteAccount();
      alert('Your account has been permanently deleted.');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.response?.data?.message || 'Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setShowSettings(false);
    }
  };

  const getProfileImageUrl = () => {
    // Priority: profileImage from database > Google photo (if available) > fallback to initial
    if (profile?.profileImage) {
      return profile.profileImage;
    }
    // If Google OAuth is implemented, you can check for Google photo here
    // For now, return null to show initial
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f2fb] flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const profileImageUrl = getProfileImageUrl();

  return (
    <div className="min-h-screen bg-[#f4f2fb] pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-10 md:px-6 lg:px-0">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">User Account Page</p>
        </header>

        <div className="grid gap-8 rounded-[32px] bg-white p-6 shadow-card lg:grid-cols-[220px_1fr] lg:p-10">
          <nav className="space-y-2">
            {sections.map(section => (
              <button
                key={section}
                onClick={() => handleSectionClick(section)}
                className={`w-full rounded-full px-4 py-2 text-left text-sm font-semibold ${
                  section === 'Profile'
                    ? 'bg-[#ff0000] text-white'
                    : section === 'Logout'
                      ? 'text-[#ff0000] hover:bg-[#ffe4e4]'
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {section}
              </button>
            ))}
          </nav>

          <div className="rounded-3xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-charcoal">Profile Information</h2>
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to initial if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!profileImageUrl && profile?.name && (
                  <span className="text-3xl font-semibold text-gray-600">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
                {!profileImageUrl && !profile?.name && (
                  <span className="text-3xl font-semibold text-gray-600">U</span>
                )}
              </div>
              {editing && (
                <div className="w-full max-w-md">
                  <label className="text-sm text-gray-500">
                    Profile Image URL
                    <input
                      type="url"
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-400">
                    Enter image URL or leave empty to use initial
                  </p>
                </div>
              )}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-full border border-[#ff0000] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#ff0000] hover:bg-[#ffe4e4] transition-colors"
                >
                Change Photo
              </button>
              )}
            </div>

            <form onSubmit={handleSave} className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-gray-500">
                Full Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                />
              </label>
              <label className="text-sm text-gray-500">
                Email Address
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                />
              </label>
              <label className="text-sm text-gray-500 md:col-span-2">
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                />
              </label>

              <div className="mt-6 flex justify-end gap-4 md:col-span-2">
                {editing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-charcoal px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-full bg-charcoal px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-charcoal">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Account</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your account settings and preferences.
                </p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Email: </span>
                    <span className="text-gray-900">{profile?.email}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Member since: </span>
                    <span className="text-gray-900">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Permanently Delete Account
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Delete Account</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to permanently delete your account? This action cannot be undone.
              All your data, orders, and preferences will be permanently removed.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



