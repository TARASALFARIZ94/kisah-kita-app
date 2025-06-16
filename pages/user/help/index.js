import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HelpCircle, // Main icon for Help
  ChevronDown, // For expandable FAQ
  ChevronUp, // For collapsible FAQ
  Mail, // For email contact
  MessageSquare, // For message / support
  CheckCircle,
  AlertCircle // For notifications
} from 'lucide-react';

import UserLayout from '@/components/layout/UserLayout'; // Import UserLayout

// Function to get token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const UserHelpPage = () => {
  const [faqs, setFaqs] = useState([]); // State to store fetched FAQs
  const [loading, setLoading] = useState(true);
  const [activeFaqIndex, setActiveFaqIndex] = useState(null); // State to track which FAQ is open
  const [notification, setNotification] = useState(null); // State for notifications

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch FAQs from the public API
  const fetchFaqs = async () => {
    setLoading(true);
    // For public FAQs, token might not be strictly necessary, but we can still send it
    const token = getAuthToken(); 
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // Fetching FAQs from the public API
      const res = await fetch('/api/faqs', { headers });
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

  // Function to toggle FAQ expansion
  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  // Effect to load FAQs on component mount
  useEffect(() => {
    fetchFaqs();
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support Center</h1>
              <p className="text-gray-600">Find answers to common questions or contact us for assistance.</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    {activeFaqIndex === index ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </button>
                  {activeFaqIndex === index && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 text-gray-700">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No FAQs Available</h3>
                <p className="mt-1 text-sm text-gray-600">Our admin will add common questions soon.</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Need More Help?</h2>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              If you can't find what you're looking for in our FAQs, feel free to reach out to our support team. We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:nasywaadt19@gmail.com" // Email updated
                className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Mail size={20} /> Email Us
              </a>
              <a 
                href="tel:+6281234567890" // Dummy phone number added
                className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors shadow-md flex items-center justify-center gap-2 border border-gray-300"
              >
                <MessageSquare size={20} /> Call Us (+62 812 3456 7890)
              </a>
            </div>
            <p className="text-gray-600 text-sm mt-4 text-center">
              Our support team is available during business hours.
            </p>
          </div>
        </div>
      </div>

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
    </UserLayout>
  );
};

export default UserHelpPage;
