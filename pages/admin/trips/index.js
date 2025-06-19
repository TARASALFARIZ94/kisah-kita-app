import React, { useEffect, useState } from "react";
import { 
  Trash2, 
  Plane, // Icon for Trip
  User, // Icon for User ID
  Calendar, // Icon for Dates
  Info, // Icon for Description/Destination
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

const TripTable = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trip'); 
      const data = await res.json();
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);
      showNotification('Failed to fetch trips. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (trip) => {
    setTripToDelete(trip);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!tripToDelete) return;

    try {
      const res = await fetch("/api/trip", { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: tripToDelete.id }), 
      });
      
      if (res.ok) {
        showNotification('Trip deleted successfully!', 'success');
        await fetchTrips();
      } else {
        const errorData = await res.json();
        console.error("Failed to delete Trip:", errorData);
        showNotification('Failed to delete Trip. Please try again.', 'error');
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

  useEffect(() => {
    fetchTrips();
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Management</h1>
              <p className="text-gray-600">Manage trip details and schedules</p>
            </div>
            {/* Removed Add New Trip button */}
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th> {/* Changed from Description to Destination */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> {/* Centered header */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Plane className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{trip.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Info className="h-4 w-4 text-gray-400" />
                        {trip.destination} {/* Changed from description to destination */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(trip.startDate).toISOString().split('T')[0]} {/* Display only date */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(trip.endDate).toISOString().split('T')[0]} {/* Display only date */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {trip.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"> {/* Centered content */}
                      <div className="flex justify-center"> {/* Centered delete button */}
                        {/* Removed Edit button */}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Trips</h3>
              <p className="mt-1 text-sm text-gray-500">No trips found to manage.</p> {/* Updated message */}
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
                    <h3 className="text-lg font-semibold text-gray-900">Delete Trip</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                
               <p className="text-gray-700 mb-6">
                  Are you sure you want to delete trip <strong>{tripToDelete?.title}</strong>? 
                  This will permanently remove the trip and all associated data.
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

        {/* Removed Create and Edit Confirmation Modals */}
      </div>
    </div>
  );
}

export default TripTable;
