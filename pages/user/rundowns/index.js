import React, { useEffect, useState } from "react";
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Plane, // For Trip selection
  ClipboardList, // For Rundown activity
  Clock, // For Activity Time
  Tag, // For Trip ID (relation)
  Info, // For general info/confirmation
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

const UserRundownsPage = () => {
  const [userTrips, setUserTrips] = useState([]); // Daftar perjalanan pengguna
  const [selectedTripId, setSelectedTripId] = useState(''); // ID perjalanan yang sedang dipilih
  const [rundowns, setRundowns] = useState([]); // Rundown untuk perjalanan yang dipilih
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingRundowns, setLoadingRundowns] = useState(false); // Loading spesifik untuk rundowns

  const [showModal, setShowModal] = useState(false);
  const [editingRundown, setEditingRundown] = useState(null);
  const [formData, setFormData] = useState({
    tripId: '', // Ini akan diisi otomatis dari selectedTripId
    activityTime: '',
    activity: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rundownToDelete, setRundownToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch all trips for the authenticated user
  const fetchUserTrips = async () => {
    setLoadingTrips(true);
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setLoadingTrips(false);
      return;
    }

    try {
      const res = await fetch('/api/user/trips', { // Mengambil trips dari API user
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUserTrips(data);
        if (data.length > 0) {
          setSelectedTripId(data[0].id.toString()); // Pilih perjalanan pertama secara default
        }
      } else {
        showNotification(data.message || 'Failed to fetch your trips.', 'error');
      }
    } catch (error) {
      console.error("Error fetching user trips:", error);
      showNotification('Network error. Failed to fetch your trips.', 'error');
    } finally {
      setLoadingTrips(false);
    }
  };

  // Fetch rundowns for a specific trip
  const fetchRundownsForTrip = async (tripId) => {
    if (!tripId) {
      setRundowns([]);
      return;
    }
    setLoadingRundowns(true);
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setLoadingRundowns(false);
      return;
    }

    try {
      const res = await fetch(`/api/user/rundowns?tripId=${tripId}`, { // Mengambil rundowns dari API user
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRundowns(data);
      } else {
        showNotification(data.message || 'Failed to fetch rundowns.', 'error');
      }
    } catch (error) {
      console.error(`Error fetching rundowns for trip ${tripId}:`, error);
      showNotification('Network error. Failed to fetch rundowns.', 'error');
    } finally {
      setLoadingRundowns(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.activityTime) {
      newErrors.activityTime = 'Activity Time is required.';
    }
    if (!formData.activity.trim()) {
      newErrors.activity = 'Activity description is required.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setFormData(prev => ({ ...prev, tripId: selectedTripId })); // Pastikan tripId disinkronkan

    if (!validateForm()) {
      return;
    }

    if (editingRundown) {
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
      const method = editingRundown ? "PUT" : "POST";
      const endpoint = editingRundown ? `/api/user/rundowns?id=${editingRundown.id}` : "/api/user/rundowns";
      
      const payload = {
        tripId: parseInt(selectedTripId), // Pastikan tripId adalah integer
        activityTime: formData.activityTime,
        activity: formData.activity.trim()
      };

      console.log("Submitting rundown payload:", payload);

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
        console.log("Rundown saved successfully:", result);
        
        showNotification(
          editingRundown ? 'Rundown updated successfully!' : 'Rundown created successfully!',
          'success'
        );
        
        handleCloseModal(); 
        await fetchRundownsForTrip(selectedTripId); 
      } else {
        const errorData = await res.json();
        console.error("Failed to save Rundown:", errorData);
        showNotification(errorData.message || 'Failed to save Rundown. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Error saving Rundown:", error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (rundown) => {
    setRundownToDelete(rundown);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!rundownToDelete) return;
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setShowDeleteConfirm(false);
      return;
    }

    try {
      const res = await fetch(`/api/user/rundowns?id=${rundownToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      if (res.ok) {
        showNotification('Rundown deleted successfully!', 'success');
        await fetchRundownsForTrip(selectedTripId); 
      } else {
        const errorData = await res.json();
        console.error("Failed to delete Rundown:", errorData);
        showNotification(errorData.message || 'Failed to delete Rundown. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Error deleting Rundown:", error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setRundownToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRundownToDelete(null);
  };

  const handleEdit = (rundown) => {
    setEditingRundown(rundown);
    setFormData({
      tripId: rundown.tripId.toString(),
      activityTime: rundown.activityTime.substring(0, 16), // Format ke YYYY-MM-DDTHH:MM untuk input datetime-local
      activity: rundown.activity
    });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRundown(null);
    setFormData({ tripId: selectedTripId, activityTime: '', activity: '' }); 
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddRundown = () => {
    setEditingRundown(null);
    setFormData({ tripId: selectedTripId, activityTime: '', activity: '' }); 
    setErrors({});
    setShowModal(true);
  };

  const handleTripSelection = (e) => {
    setSelectedTripId(e.target.value);
  };

  useEffect(() => {
    fetchUserTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchRundownsForTrip(selectedTripId);
    }
  }, [selectedTripId, userTrips]); // Tambahkan userTrips sebagai dependency agar fetch ulang jika daftar trip berubah

  if (loadingTrips) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Tampilkan pesan jika tidak ada perjalanan yang dijadwalkan
  if (userTrips.length === 0 && !loadingTrips) {
    return (
      <UserLayout> {/* Bungkus dengan UserLayout */}
        <div className="p-6 md:p-12 flex flex-col items-center justify-center text-center h-full"> {/* Tambah h-full untuk centering di layout */}
          <Plane className="mx-auto h-20 w-20 text-gray-400 mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Trips Available</h3>
          <p className="text-lg text-gray-600 mb-8">You need to create a trip first to manage its rundowns.</p>
          <Link 
            href="/user/trips" 
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
          >
            Go to My Trips to Create One
          </Link>
          <Link 
            href="/user/dashboard" 
            className="mt-4 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout> {/* Bungkus seluruh konten dengan UserLayout */}
      <div className="p-6 md:p-12"> {/* Tambahkan padding ini karena UserLayout tidak menyediakannya */}
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              {/* Link "Back to Dashboard" dihapus karena navigasi utama ada di sidebar */}
              {/* <Link
                href="/user/dashboard"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link> */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Rundown Management</h1>
              <p className="text-gray-600">Manage activities for your trips.</p>
            </div>
          </div>
        </div>

        {/* Trip Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <label htmlFor="trip-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select a Trip to Manage Rundowns:
          </label>
          <div className="flex items-center gap-4">
            <select
              id="trip-select"
              value={selectedTripId}
              onChange={handleTripSelection}
              className="flex-1 px-4 py-3 bg-gray-50/80 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm"
            >
              {userTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title} - {trip.destination} ({new Date(trip.startDate).getFullYear()})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddRundown}
              disabled={!selectedTripId} 
              className="bg-black text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Add Rundown
            </button>
          </div>
        </div>

        {/* Rundowns Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Time</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingRundowns ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-3"></div>
                        <span className="text-gray-600">Loading Rundowns...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rundowns.map((rundown) => (
                    <tr key={rundown.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-gray-800" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{new Date(rundown.activityTime).toLocaleString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-gray-400" />
                          {rundown.activity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(rundown)}
                            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(rundown)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                
                {!loadingRundowns && rundowns.length === 0 && selectedTripId && (
                    <tr>
                        <td colSpan="3" className="text-center py-8">
                            <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Rundowns for this Trip</h3>
                            <p className="mt-1 text-sm text-gray-600">Start by adding your first activity for this trip.</p>
                            <button
                              onClick={handleAddRundown}
                              className="mt-6 bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
                            >
                              Add New Rundown
                            </button>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal (Add/Edit Rundown) */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingRundown ? 'Edit Rundown' : 'Add New Rundown'}
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

                {/* Trip ID (Read-only for display) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Trip Title
                  </label>
                  <input
                    type="text"
                    value={userTrips.find(t => t.id == selectedTripId)?.title || 'N/A'}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 cursor-not-allowed"
                  />
                </div>

                {/* Activity Time Input */}
                <div>
                  <label htmlFor="activityTime" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Activity Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="activityTime"
                    id="activityTime"
                    value={formData.activityTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                      errors.activityTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.activityTime && <p className="mt-1 text-sm text-red-600">{errors.activityTime}</p>}
                </div>

                {/* Activity Description Input */}
                <div>
                  <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-2">
                    <ClipboardList className="inline h-4 w-4 mr-1" />
                    Activity *
                  </label>
                  <textarea
                    name="activity"
                    id="activity"
                    value={formData.activity}
                    onChange={handleInputChange}
                    rows="3" 
                    className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 resize-y backdrop-blur-sm ${
                      errors.activity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Visit Eiffel Tower, Dinner at local restaurant"
                    required
                  ></textarea>
                  {errors.activity && <p className="mt-1 text-sm text-red-600">{errors.activity}</p>}
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
                        {editingRundown ? 'Update Rundown' : 'Create Rundown'}
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
                    <h3 className="text-lg font-semibold text-gray-900">Delete Rundown</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete activity <strong>"{rundownToDelete?.activity}"</strong> 
                  from Trip <strong>"{userTrips.find(t => t.id == rundownToDelete?.tripId)?.title || 'Unknown Trip'}"</strong>? 
                  This will permanently remove the rundown.
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
                    Delete Rundown
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
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Info className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Create New Rundown</h3>
                    <p className="text-sm text-gray-600">Confirm rundown creation</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Trip:</span> {userTrips.find(t => t.id == selectedTripId)?.title || 'N/A'}</div>
                    <div><span className="font-medium">Activity Time:</span> {formData.activityTime}</div>
                    <div><span className="font-medium">Activity:</span> {formData.activity}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to create this new rundown?
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
                        Create Rundown
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
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Edit className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Update Rundown</h3>
                    <p className="text-sm text-gray-600">Confirm rundown changes</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Trip:</span> {userTrips.find(t => t.id == selectedTripId)?.title || 'N/A'}</div>
                    <div><span className="font-medium">Activity Time:</span> {formData.activityTime}</div>
                    <div><span className="font-medium">Activity:</span> {formData.activity}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to update activity <strong>"{editingRundown?.activity}"</strong>?
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
                        Update Rundown
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
};

export default UserRundownsPage;
