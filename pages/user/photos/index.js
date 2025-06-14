import React, { useEffect, useState } from "react";
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Plane, // For Trip selection
  Camera, // For Photo
  Link as LinkIcon, // For gdriveLink input
  Flag, // For Reported status
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

const UserPhotosPage = () => {
  const [userTrips, setUserTrips] = useState([]); // Daftar perjalanan pengguna
  const [selectedTripId, setSelectedTripId] = useState(''); // ID perjalanan yang sedang dipilih
  const [photos, setPhotos] = useState([]); // Foto untuk perjalanan yang dipilih
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false); // Loading spesifik untuk foto

  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [formData, setFormData] = useState({
    tripId: '', // Ini akan diisi otomatis dari selectedTripId
    gdriveLink: '',
    reported: false
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
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

  // Fetch photos for a specific trip
  const fetchPhotosForTrip = async (tripId) => {
    if (!tripId) {
      setPhotos([]);
      return;
    }
    setLoadingPhotos(true);
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setLoadingPhotos(false);
      return;
    }

    try {
      // Menggunakan query parameter tripId untuk filter
      const res = await fetch(`/api/user/photos?tripId=${tripId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPhotos(data);
      } else {
        showNotification(data.message || 'Failed to fetch photos.', 'error');
      }
    } catch (error) {
      console.error(`Error fetching photos for trip ${tripId}:`, error);
      showNotification('Network error. Failed to fetch photos.', 'error');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.gdriveLink.trim()) {
      newErrors.gdriveLink = 'Google Drive Link is required.';
    } else if (!/^https?:\/\/(www\.)?drive\.google\.com\//.test(formData.gdriveLink)) {
      newErrors.gdriveLink = 'Please enter a valid Google Drive link.';
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

    if (editingPhoto) {
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
      const method = editingPhoto ? "PUT" : "POST";
      const endpoint = editingPhoto ? `/api/user/photos?id=${editingPhoto.id}` : "/api/user/photos";
      
      const payload = {
        tripId: parseInt(selectedTripId), // Pastikan tripId adalah integer
        gdriveLink: formData.gdriveLink.trim(),
        reported: formData.reported // Boolean status
      };

      console.log("Submitting photo payload:", payload);

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
        console.log("Photo saved successfully:", result);
        
        showNotification(
          editingPhoto ? 'Photo updated successfully!' : 'Photo added successfully!',
          'success'
        );
        
        handleCloseModal(); 
        await fetchPhotosForTrip(selectedTripId); // Refresh photos untuk trip yang dipilih
      } else {
        const errorData = await res.json();
        console.error("Failed to save Photo:", errorData);
        showNotification(errorData.message || 'Failed to save Photo. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Error saving Photo:", error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (photo) => {
    setPhotoToDelete(photo);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!photoToDelete) return;
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setShowDeleteConfirm(false);
      return;
    }

    try {
      const res = await fetch(`/api/user/photos?id=${photoToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      if (res.ok) {
        showNotification('Photo deleted successfully!', 'success');
        await fetchPhotosForTrip(selectedTripId); // Refresh photos
      } else {
        const errorData = await res.json();
        console.error("Failed to delete Photo:", errorData);
        showNotification(errorData.message || 'Failed to delete Photo. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Error deleting Photo:", error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setPhotoToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPhotoToDelete(null);
  };

  const handleEdit = (photo) => {
    setEditingPhoto(photo);
    setFormData({
      tripId: photo.tripId.toString(),
      gdriveLink: photo.gdriveLink,
      reported: photo.reported
    });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPhoto(null);
    setFormData({ tripId: selectedTripId, gdriveLink: '', reported: false }); 
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddPhoto = () => {
    setEditingPhoto(null);
    setFormData({ tripId: selectedTripId, gdriveLink: '', reported: false }); 
    setErrors({});
    setShowModal(true);
  };

  // Handle perubahan pada dropdown pemilihan perjalanan
  const handleTripSelection = (e) => {
    setSelectedTripId(e.target.value);
  };

  // Effect untuk fetch perjalanan pengguna saat komponen di-mount
  useEffect(() => {
    fetchUserTrips();
  }, []);

  // Effect untuk fetch photos setiap kali selectedTripId berubah
  useEffect(() => {
    if (selectedTripId) {
      fetchPhotosForTrip(selectedTripId);
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
          <p className="text-lg text-gray-600 mb-8">You need to create a trip first to manage your photos.</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Photo Gallery</h1>
              <p className="text-gray-600">Manage photos for your trips.</p>
            </div>
          </div>
        </div>

        {/* Trip Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <label htmlFor="trip-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select a Trip to Manage Photos:
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
              onClick={handleAddPhoto}
              disabled={!selectedTripId} // Nonaktifkan jika belum ada trip yang dipilih
              className="bg-black text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Add Photo
            </button>
          </div>
        </div>

        {/* Photos Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Google Drive Link</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingPhotos ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-3"></div>
                        <span className="text-gray-600">Loading Photos...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  photos.map((photo) => (
                    <tr key={photo.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={photo.gdriveLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-gray-600 flex items-center gap-2 underline underline-offset-2">
                          <LinkIcon size={16} className="text-gray-400" />
                          {photo.gdriveLink.length > 50 ? photo.gdriveLink.substring(0, 50) + '...' : photo.gdriveLink}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          photo.reported 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          <Flag size={12} />
                          {photo.reported ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(photo)}
                            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(photo)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                
                {!loadingPhotos && photos.length === 0 && selectedTripId && (
                    <tr>
                        <td colSpan="3" className="text-center py-8">
                            <Camera className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Photos for this Trip</h3>
                            <p className="mt-1 text-sm text-gray-600">Start by adding your first photo for this trip.</p>
                            <button
                              onClick={handleAddPhoto}
                              className="mt-6 bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
                            >
                              Add New Photo
                            </button>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal (Add/Edit Photo) */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPhoto ? 'Edit Photo' : 'Add New Photo'}
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
                    <Plane className="inline h-4 w-4 mr-1" />
                    Trip Title
                  </label>
                  <input
                    type="text"
                    value={userTrips.find(t => t.id == selectedTripId)?.title || 'N/A'}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 cursor-not-allowed"
                  />
                </div>

                {/* Google Drive Link Input */}
                <div>
                  <label htmlFor="gdriveLink" className="block text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon className="inline h-4 w-4 mr-1" />
                    Google Drive Link *
                  </label>
                  <input
                    type="url" // Use url type for link validation
                    name="gdriveLink"
                    id="gdriveLink"
                    value={formData.gdriveLink}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
                      errors.gdriveLink ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., https://drive.google.com/..."
                    required
                  />
                  {errors.gdriveLink && <p className="mt-1 text-sm text-red-600">{errors.gdriveLink}</p>}
                </div>

                {/* Reported Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="reported"
                    id="reported"
                    checked={formData.reported}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-gray-500"
                  />
                  <label htmlFor="reported" className="ml-2 block text-sm font-medium text-gray-700">
                    <Flag className="inline h-4 w-4 mr-1" />
                    Mark as Reported
                  </label>
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
                        {editingPhoto ? 'Update Photo' : 'Add Photo'}
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
                    <h3 className="text-lg font-semibold text-gray-900">Delete Photo</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this photo (Link: <strong className="break-all">{photoToDelete?.gdriveLink}</strong>) 
                  from Trip <strong>"{userTrips.find(t => t.id == photoToDelete?.tripId)?.title || 'Unknown Trip'}"</strong>? 
                  This will permanently remove the photo.
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
                    Delete Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Confirmation Modal (not used for PhotoTable, but left if styling needed) */}
        {showCreateConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Info className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Add New Photo</h3>
                    <p className="text-sm text-gray-600">Confirm photo addition</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Trip:</span> {userTrips.find(t => t.id == selectedTripId)?.title || 'N/A'}</div>
                    <div><span className="font-medium">Link:</span> {formData.gdriveLink}</div>
                    <div><span className="font-medium">Reported:</span> {formData.reported ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to add this new photo?
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
                        Add Photo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Confirmation Modal (not used for PhotoTable, but left if styling needed) */}
        {showEditConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Edit className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Update Photo</h3>
                    <p className="text-sm text-gray-600">Confirm photo changes</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Trip:</span> {userTrips.find(t => t.id == selectedTripId)?.title || 'N/A'}</div>
                    <div><span className="font-medium">Link:</span> {formData.gdriveLink}</div>
                    <div><span className="font-medium">Reported:</span> {formData.reported ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to update this photo?
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
                        Update Photo
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

export default UserPhotosPage;
