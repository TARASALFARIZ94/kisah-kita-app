import React, { useEffect, useState } from "react";
import { 
  Trash2, 
  Image, // Icon for Photo (might not be explicitly used for display anymore but kept for overall photo context)
  Link, // Icon for GDrive Link
  Flag, // Icon for Reported status
  Plane, // Icon for Trip ID relation
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

const PhotoTable = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photo'); // Assuming API endpoint is /api/photo
      const data = await res.json();
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching photos:", error);
      showNotification('Failed to fetch photos. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (photo) => {
    setPhotoToDelete(photo);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!photoToDelete) return;

    try {
      const res = await fetch("/api/photo", { // Assuming API endpoint is /api/photo
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: photoToDelete.id }), 
      });
      
      if (res.ok) {
        showNotification('Photo deleted successfully!', 'success');
        await fetchPhotos();
      } else {
        const errorData = await res.json();
        console.error("Failed to delete Photo:", errorData);
        showNotification('Failed to delete Photo. Please try again.', 'error');
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

  useEffect(() => {
    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Photo Management</h1>
              <p className="text-gray-600">Manage trip photos and their status</p>
            </div>
            {/* Removed Add New Photo button */}
          </div>
        </div>

        {/* Photos Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {/* Removed Thumbnail header */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Google Drive Link</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip ID</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {photos.map((photo) => (
                  <tr key={photo.id} className="hover:bg-gray-50 transition-colors duration-150">
                     {/* Removed Thumbnail data cell */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={photo.gdriveLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2">
                        <Link className="h-4 w-4 text-blue-400" />
                        {photo.gdriveLink.substring(0, 30)}... {/* Truncate for display */}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        photo.reported 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        <Flag className="h-3 w-3" />
                        {photo.reported ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Plane className="h-4 w-4 text-gray-400" />
                        {photo.tripId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(photo)}
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

          {photos.length === 0 && (
            <div className="text-center py-12">
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Photos</h3>
              <p className="mt-1 text-sm text-gray-500">No photos found to manage.</p>
            </div>
          )}
        </div>

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
                  Are you sure you want to delete this photo (Trip ID: <strong>{photoToDelete?.tripId}</strong>, Link: <a href={photoToDelete?.gdriveLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{photoToDelete?.gdriveLink?.substring(0, 30)}...</a>)? 
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

        {/* No Create and Edit Confirmation Modals */}
      </div>
    </div>
  );
}

export default PhotoTable;
