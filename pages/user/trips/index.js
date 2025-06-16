import React, { useEffect, useState } from "react";
import Link from 'next/link'; 
import {
  Plus,
  Edit,
  Trash2,
  Info,
  X,
  Save,
  Plane, 
  MapPin, 
  Calendar, 
  Sparkles, 
  CheckCircle,
  AlertCircle,
  ArrowLeft 
} from 'lucide-react';

import UserLayout from '@/components/layout/UserLayout'; // Import UserLayout

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const UserTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: ''
});

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchTrips = async () => {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/trips', { 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTrips(data);
      } else {
        showNotification(data.message || 'Failed to fetch trips.', 'error');
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      showNotification('Network error. Failed to fetch trips.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Trip title is required.';
    }
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required.';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start Date is required.';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End Date is required.';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End Date must be after Start Date.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingTrip) {
      setShowEditConfirm(true);
    } else {
      setShowCreateConfirm(true);
    }
  };

  const confirmSubmit = async () => {
    setShowCreateConfirm(false);
    setShowEditConfirm(false);
    setSubmitting(true);
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setSubmitting(false);
      return;
    }

    try {
      const method = editingTrip ? "PUT" : "POST";
      const endpoint = editingTrip ? `/api/user/trips?id=${editingTrip.id}` : "/api/user/trips"; 
      
      const payload = {
        title: formData.title.trim(),
        destination: formData.destination.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      console.log("Submitting payload:", payload);

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        console.log("Trip saved successfully:", result);
        
        showNotification(
          editingTrip ? 'Trip updated successfully!' : 'Trip created successfully!',
          'success'
        );
        
        handleCloseModal(); 
        await fetchTrips(); 
      } else {
        const errorData = await res.json();
        console.error("Failed to save Trip:", errorData);
        showNotification(errorData.message || 'Failed to save Trip. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Error saving Trip:", error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (trip) => {
    setTripToDelete(trip);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!tripToDelete) return;
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setShowDeleteConfirm(false);
      return;
    }

    try {
      const res = await fetch(`/api/user/trips?id=${tripToDelete.id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      if (res.ok) {
        showNotification('Trip deleted successfully!', 'success');
        await fetchTrips();
      } else {
        const errorData = await res.json();
        console.error("Failed to delete Trip:", errorData);
        showNotification(errorData.message || 'Failed to delete Trip. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Error deleting Trip:", error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setTripToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTripToDelete(null);
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate
    });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrip(null);
    setFormData({ title: '', destination: '', startDate: '', endDate: '' });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTrip = () => {
    setEditingTrip(null);
    setFormData({ title: '', destination: '', startDate: '', endDate: '' });
    setErrors({});
    setShowModal(true);
  };

  

  useEffect(() => {
    fetchTrips();
  }, []);

  if (loading) {
    return (
      // Pastikan loader ini tetap terpusat di layar penuh saat UserLayout belum diterapkan
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <UserLayout> {/* Bungkus seluruh konten dengan UserLayout */}
      <div className="p-6 md:p-12"> {/* Tambahkan padding ini karena UserLayout tidak menyediakannya */}
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
    
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
              <p className="text-gray-600">Manage your personal travel plans.</p>
            </div>
            <button
              onClick={handleAddTrip}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-gray-800"
            >
              <Plus size={20} />
              Add New Trip
            </button>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Plane className="h-5 w-5 text-gray-800" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{trip.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {trip.destination}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(trip.startDate).toISOString().split('T')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(trip.endDate).toISOString().split('T')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(trip)}
                          className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(trip)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {trips.length === 0 && (
            <div className="text-center py-12">
              <Plane className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Trips Planned Yet</h3>
              <p className="mt-1 text-sm text-gray-600">Start by creating your first travel plan!</p>
              <button
                onClick={handleAddTrip}
                className="mt-6 bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
              >
                Create New Trip
              </button>
            </div>
          )}
        </div>

        {/* Modal (Add/Edit Trip) */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTrip ? 'Edit Trip' : 'Add New Trip'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {errors.general && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-red-700 text-sm text-center flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.general}
                    </p>
                  </div>
                )}

                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    <Plane className="inline h-4 w-4 mr-1" />
                    Trip Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Summer Adventure"
                    required
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

        
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Destination *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="destination"
                      id="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      className={`flex-1 px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                        errors.destination ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Tokyo, Japan"
                      required
                    />
                  </div>
                </div>

                {/* Start Date Input */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                </div>

                {/* End Date Input */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save size={16} />
                        Update Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Trip</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete trip <strong>"{tripToDelete?.title}"</strong> to <strong>{tripToDelete?.destination}</strong>? 
                  This will permanently remove your travel plan.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Delete Trip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Confirmation Modal */}
        {showCreateConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center"> {/* Adjusted color */}
                    <Info className="h-6 w-6 text-gray-600" /> {/* Adjusted color */}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Create New Trip</h3>
                    <p className="text-sm text-gray-600">Confirm trip creation</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Title:</span> {formData.title}</div>
                    <div><span className="font-medium">Destination:</span> {formData.destination}</div>
                    <div><span className="font-medium">Start Date:</span> {formData.startDate}</div>
                    <div><span className="font-medium">End Date:</span> {formData.endDate}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to create this new travel plan?
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateConfirm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSubmit}
                    disabled={submitting}
                    className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-gray-800"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Confirmation Modal */}
        {showEditConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center"> {/* Adjusted color */}
                    <Edit className="h-6 w-6 text-gray-600" /> {/* Adjusted color */}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Update Trip</h3>
                    <p className="text-sm text-gray-600">Confirm trip changes</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Title:</span> {formData.title}</div>
                    <div><span className="font-medium">Destination:</span> {formData.destination}</div>
                    <div><span className="font-medium">Start Date:</span> {formData.startDate}</div>
                    <div><span className="font-medium">End Date:</span> {formData.endDate}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to update <strong>"{editingTrip?.title}"</strong>?
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditConfirm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSubmit}
                    disabled={submitting}
                    className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-gray-800"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save size={16} />
                        Update Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Notification */}
        {notification && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default UserTripsPage;
