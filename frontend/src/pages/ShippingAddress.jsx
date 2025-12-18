// frontend/src/pages/ShippingAddress.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../api/userApi';
import SuccessAlert from '../components/SuccessAlert';

export default function ShippingAddress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAddress();
  }, [user, navigate]);

  const fetchAddress = async () => {
    try {
      const response = await getProfile();
      const address = response.data.address || {};
      setFormData({
        fullName: response.data.name || '',
        phone: response.data.phone || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || 'India',
      });
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const addressData = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };
      
      // Update both profile name/phone and address
      await updateProfile({
        name: formData.fullName,
        phone: formData.phone,
        address: addressData,
      });
      
      setEditing(false);
      setAlert({ isOpen: true, message: 'Shipping address updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating address:', error);
      setAlert({ isOpen: true, message: error.response?.data?.message || 'Failed to update address. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchAddress();
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f2fb] flex items-center justify-center">
        <p className="text-gray-500">Loading address...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f2fb] pb-16">
      <div className="mx-auto max-w-4xl px-4 pt-10 md:px-6 lg:px-0">
        <header className="mb-8">
          <button
            onClick={() => navigate('/account')}
            className="mb-4 text-sm text-gray-600 hover:text-charcoal transition-colors"
          >
            ← Back to Account
          </button>
          <h1 className="text-2xl font-bold text-charcoal">Shipping Address</h1>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mt-2">
            Manage your shipping address
          </p>
        </header>

        <div className="rounded-[32px] bg-white p-6 shadow-card lg:p-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-charcoal">Address Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="rounded-full bg-charcoal px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 transition-colors"
              >
                Edit Address
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-gray-500">
                Full Name *
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                  placeholder="Enter your full name"
                />
              </label>

              <label className="text-sm text-gray-500">
                Phone Number *
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                  placeholder="Enter your phone number"
                />
              </label>
            </div>

            <label className="block text-sm text-gray-500">
              Street Address *
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                disabled={!editing}
                required
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                placeholder="Enter street address"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-gray-500">
                City *
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                  placeholder="Enter city"
                />
              </label>

              <label className="text-sm text-gray-500">
                State *
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                  placeholder="Enter state"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-gray-500">
                ZIP/Postal Code *
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                  placeholder="Enter ZIP code"
                />
              </label>

              <label className="text-sm text-gray-500">
                Country *
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={!editing}
                  required
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50"
                  placeholder="Enter country"
                />
              </label>
            </div>

            {editing && (
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-charcoal px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Custom Alert Notification */}
      <SuccessAlert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}



