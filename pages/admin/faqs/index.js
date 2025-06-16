// pages/admin/faqs/index.js

import React, { useEffect, useState } from "react";
import { 
  Plus,
  Edit,
  Trash2,
  Info,
  X,
  Save,
  HelpCircle, // Icon for FAQ
  MessageSquare, // For Question
  Clipboard, // For Answer
  CheckCircle,
  AlertCircle
} from 'lucide-react';


// Fungsi untuk mendapatkan token dari localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const AdminFaqsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch FAQs from API
  const fetchFaqs = async () => {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in as admin.', 'error');
      setLoading(false);
      return;
    }

    try {
      // Changed API endpoint from /api/admin/faqs to /api/faqs
      const res = await fetch('/api/faqs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setFaqs(data);
      } else {
        showNotification(data.message || 'Failed to fetch FAQs.', 'error');
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      showNotification('Network error. Failed to fetch FAQs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.question.trim()) {
      newErrors.question = 'Question is required.';
    }
    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingFaq) {
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
      showNotification('Authentication required. Please log in as admin.', 'error');
      setSubmitting(false);
      return;
    }

    try {
      const method = editingFaq ? "PUT" : "POST";
      // Changed API endpoint from /api/admin/faqs to /api/faqs
      const endpoint = editingFaq ? `/api/faqs?id=${editingFaq.id}` : "/api/faqs"; 
      
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim()
      };

      console.log("Submitting FAQ payload:", payload);

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
        console.log("FAQ saved successfully:", result);
        
        showNotification(
          editingFaq ? 'FAQ updated successfully!' : 'FAQ created successfully!',
          'success'
        );
        
        handleCloseModal(); 
        await fetchFaqs(); 
      } else {
        const errorData = await res.json();
        console.error("Failed to save FAQ:", errorData);
        showNotification(errorData.message || 'Failed to save FAQ. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (faq) => {
    setFaqToDelete(faq);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in as admin.', 'error');
      setShowDeleteConfirm(false);
      return;
    }

    try {
      // Changed API endpoint from /api/admin/faqs to /api/faqs
      const res = await fetch(`/api/faqs?id=${faqToDelete.id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      if (res.ok) {
        showNotification('FAQ deleted successfully!', 'success');
        await fetchFaqs();
      } else {
        const errorData = await res.json();
        console.error("Failed to delete FAQ:", errorData);
        showNotification(errorData.message || 'Failed to delete FAQ. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setFaqToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setFaqToDelete(null);
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer
    });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFaq(null);
    setFormData({ question: '', answer: '' });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddFaq = () => {
    setEditingFaq(null);
    setFormData({ question: '', answer: '' });
    setErrors({});
    setShowModal(true);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  if (loading) {
    return (
      
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      
    );
  }

  return (
    
      <div className="p-6 md:p-12">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">FAQ Management</h1>
              <p className="text-gray-600">Manage frequently asked questions for users.</p>
            </div>
            <button
              onClick={handleAddFaq}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-gray-800"
            >
              <Plus size={20} />
              Add New FAQ
            </button>
          </div>
        </div>

        {/* FAQs Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-5 w-5 text-gray-800" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">{faq.question}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-2 line-clamp-3">
                        <Clipboard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        {faq.answer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(faq)}
                          className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(faq)}
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

          {faqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No FAQs Yet</h3>
              <p className="mt-1 text-sm text-gray-600">Start by adding your first frequently asked question.</p>
              <button
                onClick={handleAddFaq}
                className="mt-6 bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
              >
                Add New FAQ
              </button>
            </div>
          )}
        </div>

        {/* Modal (Add/Edit FAQ) */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
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

                {/* Question Input */}
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="inline h-4 w-4 mr-1" />
                    Question *
                  </label>
                  <textarea
                    name="question"
                    id="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 resize-y backdrop-blur-sm ${
                      errors.question ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., How do I reset my password?"
                    required
                  ></textarea>
                  {errors.question && <p className="mt-1 text-sm text-red-600">{errors.question}</p>}
                </div>

                {/* Answer Input */}
                <div>
                  <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clipboard className="inline h-4 w-4 mr-1" />
                    Answer *
                  </label>
                  <textarea
                    name="answer"
                    id="answer"
                    value={formData.answer}
                    onChange={handleInputChange}
                    rows="5"
                    className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 resize-y backdrop-blur-sm ${
                      errors.answer ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Provide a detailed answer here..."
                    required
                  ></textarea>
                  {errors.answer && <p className="mt-1 text-sm text-red-600">{errors.answer}</p>}
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
                        {editingFaq ? 'Update FAQ' : 'Create FAQ'}
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
                    <h3 className="text-lg font-semibold text-gray-900">Delete FAQ</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete the FAQ: <strong>"{faqToDelete?.question}"</strong>? 
                  This will permanently remove it.
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
                    Delete FAQ
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
                    <h3 className="text-lg font-semibold text-gray-900">Create New FAQ</h3>
                    <p className="text-sm text-gray-600">Confirm FAQ creation</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Question:</span> {formData.question}</div>
                    <div><span className="font-medium">Answer:</span> {formData.answer}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to create this new FAQ?
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
                        Create FAQ
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
                    <h3 className="text-lg font-semibold text-gray-900">Update FAQ</h3>
                    <p className="text-sm text-gray-600">Confirm FAQ changes</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Question:</span> {formData.question}</div>
                    <div><span className="font-medium">Answer:</span> {formData.answer}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to update this FAQ?
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
                        Update FAQ
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
    
  );
};

export default AdminFaqsPage;
