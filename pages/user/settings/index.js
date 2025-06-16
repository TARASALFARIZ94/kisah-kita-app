import React, { useEffect, useState } from "react";
import Link from 'next/link';
import {
  User, // For user profile icon
  Mail, // For email icon
  Lock, // For password icon
  Save, // For save button
  CheckCircle,
  AlertCircle,
  ArrowLeft // For back button (removed from header, handled by sidebar)
} from 'lucide-react';

import UserLayout from '@/components/layout/UserLayout'; // Import UserLayout

// Fungsi untuk mendapatkan token dari localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const UserSettingsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setLoading(false);
      return;
    }

    try {
      // Asumsi ada API endpoint untuk mengambil profil user yang terautentikasi
      const res = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          name: data.name,
          email: data.email,
          // Password fields are intentionally left empty for security
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
      } else {
        showNotification(data.message || 'Failed to load profile data.', 'error');
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      showNotification('Network error. Failed to load profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address.';
    }

    // Validasi password jika ada perubahan
    if (formData.newPassword || formData.currentPassword || formData.confirmNewPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current Password is required to change password.';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New Password must be at least 6 characters.';
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'New Password and Confirm New Password do not match.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    
    if (!validateForm()) {
      showNotification('Please correct the form errors.', 'error');
      return;
    }

    setSubmitting(true);
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      // Hanya tambahkan password ke payload jika ada perubahan
      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch('/api/user/profile', { // Menggunakan API endpoint ini untuk update
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'Profile updated successfully!', 'success');
        // Reset password fields after successful update
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
        // Optionally re-fetch profile to ensure latest data is displayed (e.g., if email changed)
        fetchUserProfile(); 
      } else {
        console.error("Failed to update profile:", data);
        showNotification(data.message || 'Failed to update profile. Please try again.', 'error');
        setErrors(prev => ({ ...prev, general: data.message || 'Failed to update profile.' }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification('Network error. Please try again.', 'error');
      setErrors(prev => ({ ...prev, general: 'Network error. Please try again.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) { // Clear specific error when input changes
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) { // Clear general error on any input change
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="p-6 md:p-12">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
              <p className="text-gray-600">Manage your profile information and password.</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-red-700 text-sm text-center flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.general}
                </p>
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Your full name"
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <h2 className="text-xl font-semibold text-gray-900 pt-4 border-t border-gray-100">Change Password</h2>
            <p className="text-sm text-gray-600 mb-4">Leave blank if you don't want to change your password.</p>

            {/* Current Password Input */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline h-4 w-4 mr-1" />
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                  errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter current password"
              />
              {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
            </div>

            {/* New Password Input */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline h-4 w-4 mr-1" />
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter new password (min 6 characters)"
              />
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            {/* Confirm New Password Input */}
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline h-4 w-4 mr-1" />
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmNewPassword"
                id="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                  errors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
              />
              {errors.confirmNewPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserSettingsPage;
