import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  DollarSign,
  Users,
  ShoppingBag,
  Info,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Receipt
} from 'lucide-react';

import UserLayout from '@/components/layout/UserLayout'; // Pastikan path ini benar

// --- UTILITY FUNCTIONS ---
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const formatCurrency = (amount) => {
  return `Rp${amount.toLocaleString('id-ID')}`;
};

const calculateSplitSummary = (bill) => {
  if (!bill || !Array.isArray(bill.participants) || !Array.isArray(bill.expenses)) {
    return {};
  }

  const summary = {};
  bill.participants.forEach(name => {
    summary[name] = { totalOwed: 0, totalPaid: 0, balance: 0 };
  });

  bill.expenses.forEach(expense => {
    if (expense.paidBy && summary[expense.paidBy]) {
      summary[expense.paidBy].totalPaid += expense.totalAmount;
    }
    const participantsInThisExpense = Array.isArray(expense.splitAmong) ? expense.splitAmong : [];
    const numParticipants = participantsInThisExpense.length;

    if (numParticipants > 0) {
      const sharePerPerson = expense.totalAmount / numParticipants;
      participantsInThisExpense.forEach(name => {
        if (summary[name]) {
          summary[name].totalOwed += sharePerPerson;
        }
      });
    }
  });

  bill.participants.forEach(name => {
    if (summary[name]) {
      summary[name].balance = summary[name].totalPaid - summary[name].totalOwed;
    }
  });
  return summary;
};

// --- REUSABLE UI COMPONENTS (TETAP DI SINI SESUAI PERMINTAAN) ---
const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);
  if (!notification) return null;
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
        notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span>{notification.message}</span>
        <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1 transition-colors"><X size={16} /></button>
      </div>
    </div>
  );
};

const LoadingSpinner = ({ size = 'medium', text = '' }) => {
  const sizeClasses = { small: 'h-4 w-4', medium: 'h-8 w-8', large: 'h-12 w-12' };
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-current ${sizeClasses[size]} mr-3`}></div>
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[95vh] overflow-hidden`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">{children}</div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info', isLoading = false }) => {
  const iconConfig = {
    info: { icon: Info, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' },
    warning: { icon: AlertCircle, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    danger: { icon: AlertCircle, bgColor: 'bg-red-100', iconColor: 'text-red-600' },
    success: { icon: CheckCircle, bgColor: 'bg-green-100', iconColor: 'text-green-600' }
  };
  const config = iconConfig[type];
  const Icon = config.icon;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`h-12 w-12 rounded-full ${config.bgColor} flex items-center justify-center`}><Icon className={`h-6 w-6 ${config.iconColor}`} /></div>
          <div><h3 className="text-lg font-semibold text-gray-900">{title}</h3></div>
        </div>
        <div className="mb-6">{typeof message === 'string' ? <p className="text-gray-700">{message}</p> : message}</div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200 disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-white ${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'}`}>
            {isLoading ? <LoadingSpinner size="small" /> : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const FormField = ({ label, error, children, required = false, icon: Icon }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {Icon && <Icon className="inline h-4 w-4 mr-1 text-gray-500" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
      error ? 'border-red-500' : 'border-gray-300'
    } ${props.readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
  />
);

const Select = ({ error, children, ...props }) => (
  <select
    {...props}
    className={`w-full px-4 py-3 bg-gray-50/80 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500 transition-colors duration-200 backdrop-blur-sm ${
      error ? 'border-red-500' : 'border-gray-300'
    }`}
  >
    {children}
  </select>
);

// --- MAIN COMPONENT ---
export default function SplitBillPage() {
  // --- STATE MANAGEMENT ---
  const [userBills, setUserBills] = useState([]);
  const [selectedBillId, setSelectedBillId] = useState('');
  const [currentBill, setCurrentBill] = useState(null);
  const [loadingBills, setLoadingBills] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modal visibility states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCreateBillModal, setShowCreateBillModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // Form data states
  const [expenseForm, setExpenseForm] = useState({
    description: '', quantity: 1, totalAmount: '', paidBy: '', splitAmong: []
  });
  const [newBillForm, setNewBillForm] = useState({
    name: '', participants: ''
  });

  // Edit/Delete specific item states
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null); // Local state for item to delete

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // --- UTILITY FUNCTIONS FOR COMPONENT LOGIC ---
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };
  const closeNotification = () => setNotification(null);

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '', quantity: 1, totalAmount: '',
      paidBy: (currentBill?.participants?.[0]) || '',
      splitAmong: currentBill?.participants || []
    });
    setFormErrors({});
  };

  const resetNewBillForm = () => {
    setNewBillForm({ name: '', participants: '' });
    setFormErrors({});
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
    setEditingExpense(null);
    resetExpenseForm();
  };

  const closeCreateBillModal = () => {
    setShowCreateBillModal(false);
    resetNewBillForm();
    setSubmitting(false); // Reset submitting state after modal closes
  };

  // --- API CALL FUNCTIONS ---
  const fetchUserBills = async () => {
    setLoadingBills(true);
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setLoadingBills(false);
      return;
    }

    try {
      const res = await fetch('/api/bills', { headers: { 'Authorization': `Bearer ${token}` } });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textError = await res.text();
        throw new Error(`Invalid response from /api/bills (${res.status}). Content: ${textError.substring(0, 100)}...`);
      }
      const data = await res.json();

      if (res.ok) {
        setUserBills(data);
        if (data.length > 0) {
          const currentBillExists = data.some(bill => bill.id === selectedBillId);
          if (!selectedBillId || !currentBillExists) {
            setSelectedBillId(data[0].id);
            setCurrentBill(data[0]);
          } else {
            // Update currentBill with fresh data if it exists
            const freshCurrentBill = data.find(bill => bill.id === selectedBillId);
            setCurrentBill(freshCurrentBill || null);
          }
          setExpenseForm(prev => ({
            ...prev, paidBy: (currentBill?.participants?.[0]) || '', splitAmong: currentBill?.participants || []
          }));
        } else {
          setCurrentBill(null);
          setSelectedBillId('');
          resetExpenseForm();
        }
      } else {
        showNotification(data.message || 'Failed to fetch bills.', 'error');
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      showNotification('Network error or invalid API response for bills.', 'error');
    } finally {
      setLoadingBills(false);
    }
  };

  const fetchExpensesForBill = async (billId) => {
    if (!billId) {
      setCurrentBill(null);
      setLoadingExpenses(false);
      return;
    }
    // Optimization: Skip fetching if current bill is already loaded and matches ID
    if (currentBill && currentBill.id === billId && !loadingExpenses) {
        return;
    }

    setLoadingExpenses(true);
    const token = getAuthToken();
    if (!token) {
      showNotification('Authentication required.', 'error');
      setLoadingExpenses(false);
      return;
    }

    try {
      const res = await fetch(`/api/bills/${billId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textError = await res.text();
        throw new Error(`Invalid response from /api/bills/<span class="math-inline">\{billId\} \(</span>{res.status}). Content: ${textError.substring(0, 100)}...`);
      }
      const data = await res.json();

      if (res.ok) {
        setCurrentBill(data);
        setExpenseForm(prev => ({
          ...prev, paidBy: (data.participants?.[0]) || '', splitAmong: data.participants || []
        }));
      } else {
        showNotification(data.message || 'Failed to fetch bill details.', 'error');
        setCurrentBill(null);
      }
    } catch (error) {
      console.error('Error fetching bill details:', error);
      showNotification('Network error or invalid API response for bill details.', 'error');
      setCurrentBill(null);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleCreateNewBill = async () => {
    const names = newBillForm.participants.split(',').map(name => name.trim()).filter(name => name !== '');
    if (!newBillForm.name.trim() || names.length === 0) {
      setFormErrors({ name: !newBillForm.name.trim() ? 'Bill name is required.' : '', participants: names.length === 0 ? 'At least one participant is required.' : '' });
      return;
    }
    setSubmitting(true);
    const token = getAuthToken();
    if (!token) { showNotification('Authentication required.', 'error'); setSubmitting(false); return; }

    try {
      const res = await fetch('/api/bills', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newBillForm.name, participants: names })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textError = await res.text();
        throw new Error(`Invalid response from /api/bills (${res.status}). Content: ${textError.substring(0, 100)}...`);
      }
      const newBillData = await res.json();

      if (res.ok) {
        showNotification('Bill created successfully!', 'success');
        setUserBills(prev => [...prev, newBillData]);
        setSelectedBillId(newBillData.id);
        setCurrentBill(newBillData);
        closeCreateBillModal();
        setExpenseForm(prev => ({
          ...prev, paidBy: (newBillData.participants?.[0]) || '', splitAmong: newBillData.participants || []
        }));
      } else {
        showNotification(newBillData.message || 'Failed to create bill.', 'error');
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      showNotification('Network error or invalid API response for bill creation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    const isFormValid = (() => {
      const errors = {};
      if (!expenseForm.description.trim()) errors.description = 'Description is required.';
      const amount = parseFloat(expenseForm.totalAmount);
      if (isNaN(amount) || amount <= 0) errors.totalAmount = 'Valid amount required.';
      if (!expenseForm.paidBy) errors.paidBy = 'Payer is required.';
      if (expenseForm.splitAmong.length === 0) errors.splitAmong = 'At least one participant.';
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    })();
    if (!isFormValid) return;

    // Use current state values for confirmation, not form state that might be changed by re-render
    const confirmMessage = (
      <div>
        <p>Are you sure you want to {editingExpense ? 'update' : 'add'} this expense?</p>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium">{expenseForm.description}</p>
          <p className="text-sm text-gray-600">Amount: {formatCurrency(parseFloat(expenseForm.totalAmount))}</p>
        </div>
      </div>
    );

    if (editingExpense) {
      setNotification({ message: confirmMessage, type: 'info', onConfirm: confirmSendExpenseData, title: 'Confirm Update' });
      setShowEditConfirm(true);
    } else {
      setNotification({ message: confirmMessage, type: 'info', onConfirm: confirmSendExpenseData, title: 'Confirm Add' });
      setShowCreateConfirm(true);
    }
  };

  const confirmSendExpenseData = async () => {
    setShowCreateConfirm(false); // Close confirmation modal if open
    setShowEditConfirm(false); // Close confirmation modal if open
    setSubmitting(true);
    const token = getAuthToken();
    if (!token) { showNotification('Auth required.', 'error'); setSubmitting(false); return; }
    if (!selectedBillId) { showNotification('No bill selected.', 'error'); setSubmitting(false); return; }

    try {
      const method = editingExpense ? 'PUT' : 'POST';
      const endpoint = editingExpense ? `/api/expenses/${editingExpense.id}` : `/api/bills/${selectedBillId}/expenses`;
      const payload = {
        ...(editingExpense ? {} : { billId: selectedBillId }),
        description: expenseForm.description.trim(),
        quantity: expenseForm.quantity,
        totalAmount: parseFloat(expenseForm.totalAmount),
        paidBy: expenseForm.paidBy,
        splitAmong: expenseForm.splitAmong
      };

      const res = await fetch(endpoint, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textError = await res.text();
        throw new Error(`Invalid response from <span class="math-inline">\{endpoint\} \(</span>{res.status}). Content: ${textError.substring(0, 100)}...`);
      }
      const result = await res.json();

      if (res.ok) {
        showNotification(editingExpense ? 'Expense updated!' : 'Expense added!', 'success');
        closeExpenseModal();
        if (selectedBillId) await fetchExpensesForBill(selectedBillId);
      } else {
        showNotification(result.message || 'Failed to save expense.', 'error');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      showNotification('Network error or invalid API response.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense); // Set the item to delete
    setShowDeleteConfirm(true); // Open confirmation modal
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) { // Ensure expenseToDelete is not null
      showNotification('No expense selected for deletion.', 'error');
      setShowDeleteConfirm(false);
      return;
    }
    setSubmitting(true);
    const token = getAuthToken();
    if (!token) { showNotification('Auth required.', 'error'); setSubmitting(false); return; }

    try {
      const res = await fetch(`/api/expenses/${expenseToDelete.id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 204) { // Explicitly check for 204 No Content
        showNotification('Expense deleted successfully!', 'success');
        if (selectedBillId) await fetchExpensesForBill(selectedBillId);
      } else if (res.ok) { // For other 2xx status codes (e.g., 200 OK with body)
        const result = await res.json();
        showNotification(result.message || 'Expense deleted successfully!', 'success');
        if (selectedBillId) await fetchExpensesForBill(selectedBillId);
      } else { // For 4xx, 5xx status codes
        let errorData = { message: `Failed with status ${res.status}` };
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          try { errorData = await res.json(); } catch (e) { /* ... */ }
        } else {
          const textError = await res.text(); // Log text for non-JSON errors
          console.error('Delete error response was not JSON:', textError);
          errorData.message = `Failed with status ${res.status} (expected JSON, got HTML/text).`;
        }
        showNotification(errorData.message || 'Failed to delete expense.', 'error');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
      setShowDeleteConfirm(false);
      setExpenseToDelete(null); // Reset after operation
    }
  };

  const cancelDeleteExpense = () => {
    setShowDeleteConfirm(false);
    setExpenseToDelete(null);
  };

  const handleBillSelection = (e) => {
    const billId = e.target.value;
    setSelectedBillId(billId);
    const selected = userBills.find(bill => bill.id === billId);
    setCurrentBill(selected || null);
    // Update form defaults for expense based on newly selected bill
    setExpenseForm(prev => ({
      ...prev, paidBy: (selected?.participants?.[0]) || '', splitAmong: selected?.participants || []
    }));
  };

  // --- useEffect HOOKS ---
  // Effect 1: Fetch all bills on component mount
  useEffect(() => {
    fetchUserBills();
  }, []); // Run only once

  // Effect 2: Fetch expenses for the selected bill
  useEffect(() => {
    if (selectedBillId) {
      // Only fetch if currentBill is not set or its ID doesn't match selectedBillId
      // This prevents infinite loops if currentBill updates trigger this effect
      if (!currentBill || currentBill.id !== selectedBillId) {
        fetchExpensesForBill(selectedBillId);
      }
    } else {
      setCurrentBill(null); // Clear current bill if no ID selected
      setLoadingExpenses(false);
    }
  }, [selectedBillId, userBills]); // Depend on selectedBillId and userBills (for initial data)

  // --- RENDER LOGIC ---
  const summary = calculateSplitSummary(currentBill);

  // Initial loading state
  if (loadingBills) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
          <LoadingSpinner size="large" text="Loading bills..." />
        </div>
      </UserLayout>
    );
  }

  // No bills found state
  if (userBills.length === 0 && !loadingBills) {
    return (
      <UserLayout>
        <div className="p-6 md:p-12 flex flex-col items-center justify-center text-center h-full">
          <DollarSign className="mx-auto h-20 w-20 text-gray-400 mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Split Bills Available</h3>
          <p className="text-lg text-gray-600 mb-8">Start by creating your first split bill.</p>
          <button
            onClick={() => setShowCreateBillModal(true)}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
          >
            <Plus size={18} className="inline-block mr-2" /> Create New Bill
          </button>
          <Link href="/user/dashboard" className="mt-4 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
        {/* Create Bill Modal for empty state */}
        <Modal isOpen={showCreateBillModal} onClose={closeCreateBillModal} title="Create New Split Bill">
          <form onSubmit={(e) => { e.preventDefault(); handleCreateNewBill(); }} className="p-6 space-y-4">
            <FormField label="Bill Name" required icon={DollarSign} error={formErrors.name}>
              <Input type="text" name="name" value={newBillForm.name} onChange={(e) => setNewBillForm({ ...newBillForm, name: e.target.value })} placeholder="E.g., Dinner at AEON" error={formErrors.name} />
            </FormField>
            <FormField label="Participant Names" required icon={Users} error={formErrors.participants}>
              <Input type="text" name="participants" value={newBillForm.participants} onChange={(e) => setNewBillForm({ ...newBillForm, participants: e.target.value })} placeholder="E.g., Dinnar, Nasywa, Farhan" error={formErrors.participants} />
              <p className="mt-1 text-xs text-gray-500">Separate names with commas (,)</p>
            </FormField>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeCreateBillModal} disabled={submitting} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-gray-800">
                {submitting ? <LoadingSpinner size="small" /> : <> <Save size={16} /> Create Bill</>}
              </button>
            </div>
          </form>
        </Modal>
        <Notification notification={notification} onClose={closeNotification} />
      </UserLayout>
    );
  }

  // Main content when bills exist
  return (
    <UserLayout>
      <div className="p-6 md:p-12 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Split Bill</h1>
              <p className="text-gray-600">Manage your travel expenses and split bills with ease.</p>
            </div>
          </div>
        </div>

        {/* Bill Selection & Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <FormField label="Select Bill" icon={Receipt}>
                <Select value={selectedBillId} onChange={handleBillSelection}>
                  <option value="">Choose a bill...</option>
                  {userBills.map(bill => (
                    <option key={bill.id} value={bill.id}>{bill.name} ({bill.participants?.length || 0} participants)</option>
                  ))}
                </Select>
              </FormField>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row mt-6">
              <button onClick={() => setShowCreateBillModal(true)} className="bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap">
                <Plus size={18} /> Create New Bill
              </button>
              <button onClick={() => { setShowExpenseModal(true); setEditingExpense(null); resetExpenseForm(); }} disabled={!selectedBillId} className="bg-gray-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                <ShoppingBag size={18} /> Add Expense
              </button>
            </div>
          </div>
          {selectedBillId && currentBill && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
              <span className="font-medium">Current Bill:</span> {currentBill.name}<br />
              <span className="font-medium">Participants:</span> {currentBill.participants?.join(', ') || 'N/A'}
            </div>
          )}
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Expenses</h3>
            <span className="text-sm text-gray-500">{currentBill?.expenses?.length || 0} expense(s)</span>
          </div>

          {loadingExpenses ? (
            <div className="text-center py-12"><LoadingSpinner size="large" text="Loading expenses..." /></div>
          ) : (!currentBill || !currentBill.expenses || currentBill.expenses.length === 0) ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Expenses Yet</h4>
              <p className="text-gray-600 mb-6">Start by adding your first expense to this bill.</p>
              <button onClick={() => { setShowExpenseModal(true); setEditingExpense(null); resetExpenseForm(); }} className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto">
                <Plus size={18} /> Add First Expense
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentBill.expenses.map(expense => (
                <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{expense.description}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div><span className="text-gray-600">Amount:</span><p className="font-medium text-lg text-gray-900">{formatCurrency(expense.totalAmount)}</p></div>
                        <div><span className="text-gray-600">Paid by:</span><p className="font-medium text-gray-900">{expense.paidBy}</p></div>
                        <div><span className="text-gray-600">Split among:</span><p className="font-medium text-gray-900">{expense.splitAmong?.join(', ') || 'No one'}</p></div>
                      </div>
                      {expense.quantity > 1 && (<div className="mt-2 text-sm text-gray-600">Quantity: {expense.quantity}</div>)}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => { setEditingExpense(expense); setShowExpenseModal(true); setExpenseForm({ ...expenseForm, ...expense, totalAmount: expense.totalAmount.toString() }); }} className="p-2 text-gray-600 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Edit expense"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteExpense(expense)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete expense"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Split Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-gray-500" /> Split Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBill?.participants?.map(participant => {
              const participantSummary = summary[participant] || { totalOwed: 0, totalPaid: 0, balance: 0 };
              const isPositive = participantSummary.balance > 0;
              const isNegative = participantSummary.balance < 0;
              return (
                <div key={participant} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">{participant}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Total Paid:</span><span className="font-medium text-green-600">{formatCurrency(participantSummary.totalPaid)}</span></div>
                    <div className="flex justify-between"><span>Total Owed:</span><span className="font-medium text-red-600">{formatCurrency(participantSummary.totalOwed)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-gray-200"><span>Balance:</span>
                      <span className={`font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-900'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(participantSummary.balance)}
                      </span>
                    </div>
                    {isPositive && (<p className="text-xs text-green-600 mt-1">Should receive money</p>)}
                    {isNegative && (<p className="text-xs text-red-600 mt-1">Owes money</p>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add/Edit Expense Modal */}
        <Modal isOpen={showExpenseModal} onClose={closeExpenseModal} title={editingExpense ? 'Edit Expense' : 'Add New Expense'} size="lg">
          <form onSubmit={handleExpenseSubmit} className="p-6 space-y-6">
            <FormField label="Description" required icon={ShoppingBag} error={formErrors.description}>
              <Input type="text" name="description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="E.g., Lunch at restaurant" error={formErrors.description} />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Quantity" error={formErrors.quantity}>
                <Input type="number" name="quantity" value={expenseForm.quantity} onChange={(e) => setExpenseForm({ ...expenseForm, quantity: parseInt(e.target.value) || 1 })} min="1" error={formErrors.quantity} />
              </FormField>
              <FormField label="Total Amount" required icon={DollarSign} error={formErrors.totalAmount}>
                <Input type="number" name="totalAmount" value={expenseForm.totalAmount} onChange={(e) => setExpenseForm({ ...expenseForm, totalAmount: e.target.value })} placeholder="0" min="0" step="0.01" error={formErrors.totalAmount} />
              </FormField>
            </div>
            <FormField label="Paid By" required error={formErrors.paidBy}>
              <Select name="paidBy" value={expenseForm.paidBy} onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })} error={formErrors.paidBy}>
                <option value="">Select who paid...</option>
                {currentBill?.participants?.map(p => (<option key={p} value={p}>{p}</option>))}
              </Select>
            </FormField>
            <FormField label="Split Among" required error={formErrors.splitAmong}>
              <div className="space-y-3">
                {currentBill?.participants?.map(p => (
                  <label key={p} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" name="splitAmong" value={p} checked={expenseForm.splitAmong.includes(p)} onChange={(e) => {
                      const newSplitAmong = e.target.checked ? [...expenseForm.splitAmong, p] : expenseForm.splitAmong.filter(item => item !== p);
                      setExpenseForm({ ...expenseForm, splitAmong: newSplitAmong });
                    }} className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500" />
                    <span className="text-gray-900 font-medium">{p}</span>
                  </label>
                ))}
              </div>
              {formErrors.splitAmong && (<p className="mt-2 text-sm text-red-600">{formErrors.splitAmong}</p>)}
            </FormField>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeExpenseModal} disabled={submitting} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-gray-800">
                {submitting ? <LoadingSpinner size="small" /> : <> <Save size={16} /> {editingExpense ? 'Update' : 'Add'} Expense</>}
              </button>
            </div>
          </form>
        </Modal>

        {/* Create Bill Modal */}
        <Modal isOpen={showCreateBillModal} onClose={closeCreateBillModal} title="Create New Split Bill">
          <form onSubmit={(e) => { e.preventDefault(); handleCreateNewBill(); }} className="p-6 space-y-4">
            <FormField label="Bill Name" required icon={DollarSign} error={formErrors.name}>
              <Input type="text" name="name" value={newBillForm.name} onChange={(e) => setNewBillForm({ ...newBillForm, name: e.target.value })} placeholder="E.g., Dinner at AEON" error={formErrors.name} />
            </FormField>
            <FormField label="Participant Names" required icon={Users} error={formErrors.participants}>
              <Input type="text" name="participants" value={newBillForm.participants} onChange={(e) => setNewBillForm({ ...newBillForm, participants: e.target.value })} placeholder="E.g., Dinnar, Nasywa, Farhan" error={formErrors.participants} />
              <p className="mt-1 text-xs text-gray-500">Separate names with commas (,)</p>
            </FormField>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeCreateBillModal} disabled={submitting} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-gray-800">
                {submitting ? <LoadingSpinner size="small" /> : <> <Save size={16} /> Create Bill</>}
              </button>
            </div>
          </form>
        </Modal>

        {/* Confirmation Modals */}
        <ConfirmationModal
          isOpen={showCreateConfirm} onClose={() => setShowCreateConfirm(false)} onConfirm={confirmSendExpenseData} title="Add Expense"
          message={
            <div>
              <p>Are you sure you want to add this expense?</p>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{expenseForm.description}</p>
                <p className="text-sm text-gray-600">Amount: {formatCurrency(parseFloat(expenseForm.totalAmount))}</p>
              </div>
            </div>
          } type="info" isLoading={submitting}
        />
        <ConfirmationModal
          isOpen={showEditConfirm} onClose={() => setShowEditConfirm(false)} onConfirm={confirmSendExpenseData} title="Update Expense"
          message={
            <div>
              <p>Are you sure you want to update this expense?</p>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{expenseForm.description}</p>
                <p className="text-sm text-gray-600">Amount: {formatCurrency(parseFloat(expenseForm.totalAmount))}</p>
              </div>
            </div>
          } type="info" isLoading={submitting}
        />
        <ConfirmationModal
          isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDeleteExpense} title="Delete Expense"
          message={
            <div>
              <p>Are you sure you want to delete this expense?</p>
              {expenseToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{expenseToDelete.description}</p>
                  <p className="text-sm text-gray-600">Amount: {formatCurrency(expenseToDelete.totalAmount)}</p>
                </div>
              )}
              {!expenseToDelete && (<p className="text-red-500">Error: Expense details not available.</p>)}
              <p className="mt-3 text-sm text-gray-600">This action cannot be undone.</p>
            </div>
          } type="danger" isLoading={submitting}
        />

        {/* Notification */}
        <Notification notification={notification} onClose={closeNotification} />
      </div>
    </UserLayout>
  );
}