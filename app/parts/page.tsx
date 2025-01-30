'use client';

import { useState, useEffect } from 'react';
import { getParts, createPart, deletePart, getCustomers, createCustomer, getBOMItems, createBOMItem } from '@/lib/api';
import { Card, Title } from '@tremor/react';
import type { Part, BOMItem, BOMItemFormData, Customer } from '../types';

interface PartFormData {
  part_number: string;
  description: string;
  customer_id: string;
  price: string;
  cycle_time: string;
  setup_time: string;
  compatible_machines: string;
}

interface CustomerFormData {
  name: string;
  address: string;
  phone: string;
  contact_person: string;
  email: string;
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [formData, setFormData] = useState<PartFormData>({
    part_number: '',
    description: '',
    customer_id: '',
    price: '',
    cycle_time: '',
    setup_time: '',
    compatible_machines: '',
  });
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    name: '',
    address: '',
    phone: '',
    contact_person: '',
    email: '',
  });
  const [bomFormData, setBomFormData] = useState<BOMItemFormData>({
    child_part_id: '',
    quantity: '',
    process_step: '',
    setup_time: '',
    cycle_time: '',
    notes: '',
  });

  useEffect(() => {
    loadParts();
    loadCustomers();
  }, []);

  async function loadParts() {
    try {
      const data = await getParts();
      setParts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error('Error loading customers:', err);
    }
  }

  async function loadBOMItems(partId: number) {
    try {
      const data = await getBOMItems(partId);
      setBomItems(data);
    } catch (err: any) {
      console.error('Error loading BOM items:', err);
    }
  }

  async function handleAddPart(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.customer_id) {
      setError("Please select a customer");
      return;
    }

    try {
      const data = {
        part_number: formData.part_number,
        description: formData.description,
        customer_id: parseInt(formData.customer_id),
        material: "N/A", // Default value since we're not using this field
        price: parseFloat(formData.price),
        cycle_time: parseFloat(formData.cycle_time),
        setup_time: parseFloat(formData.setup_time),
        compatible_machines: formData.compatible_machines.split(',').map(m => m.trim()).filter(Boolean),
      };
      
      await createPart(data);
      loadParts();
      setShowAddModal(false);
      setFormData({
        part_number: '',
        description: '',
        customer_id: '',
        price: '',
        cycle_time: '',
        setup_time: '',
        compatible_machines: '',
      });
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAddBOMItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPart) return;
    
    try {
      const data = {
        parent_part_id: selectedPart.id,
        child_part_id: parseInt(bomFormData.child_part_id),
        quantity: parseFloat(bomFormData.quantity),
        process_step: bomFormData.process_step,
        setup_time: parseFloat(bomFormData.setup_time),
        cycle_time: parseFloat(bomFormData.cycle_time),
        notes: bomFormData.notes || undefined,
      };
      
      await createBOMItem(data);
      loadBOMItems(selectedPart.id);
      setBomFormData({
        child_part_id: '',
        quantity: '',
        process_step: '',
        setup_time: '',
        cycle_time: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCustomer(customerFormData);
      await loadCustomers(); // Refresh the customers list
      setShowCustomerModal(false);
      setCustomerFormData({
        name: '',
        address: '',
        phone: '',
        contact_person: '',
        email: '',
      });
    } catch (err: any) {
      console.error('Error creating customer:', err);
      setError(err.message);
    }
  }

  async function handleDeletePart(id: number) {
    try {
      await deletePart(id);
      loadParts();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function handleOpenBOM(part: any) {
    setSelectedPart(part);
    loadBOMItems(part.id);
    setShowBOMModal(true);
  }

  const handleShowAddModal = async () => {
    await loadCustomers(); // Refresh customers list when opening the modal
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Parts Management</Title>
      <div className="mt-6">
        <button
          onClick={handleShowAddModal}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add Part
        </button>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parts.map((part) => (
                  <tr key={part.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{part.part_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{part.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{part.customer?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${part.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleOpenBOM(part)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        BOM
                      </button>
                      <button
                        onClick={() => handleDeletePart(part.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Part Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Add New Part</h2>
                <p className="text-sm text-gray-600 mt-1">After creating the part, you can add components to its Bill of Materials (BOM) using the BOM button in the Actions column.</p>
              </div>
            </div>
            <form onSubmit={handleAddPart}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Part Number</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.part_number}
                    onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <select
                      value={formData.customer_id}
                      onChange={(e) => {
                        setFormData({ ...formData, customer_id: e.target.value });
                        setSelectedCustomer(e.target.value);
                      }}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cycle Time (minutes)</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.cycle_time}
                    onChange={(e) => setFormData({ ...formData, cycle_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Compatible Machines (comma-separated)</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.compatible_machines}
                    onChange={(e) => setFormData({ ...formData, compatible_machines: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Setup Time (minutes)</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.setup_time}
                    onChange={(e) => setFormData({ ...formData, setup_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:from-indigo-700 hover:to-purple-700 transition-colors"
                >
                  Create Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Customer</h2>
            <form onSubmit={handleAddCustomer}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={customerFormData.name}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={customerFormData.address}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={customerFormData.phone}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={customerFormData.contact_person}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, contact_person: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={customerFormData.email}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOM Modal */}
      {showBOMModal && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Bill of Materials - {selectedPart.part_number}
            </h2>
            
            {/* Current BOM Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Components List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-indigo-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Component</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Process Step</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Setup Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Cycle Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100">
                    {bomItems.map((item) => {
                      const childPart = parts.find(p => p.id === item.child_part_id);
                      return (
                        <tr key={item.id} className="hover:bg-indigo-50/50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <div className="text-indigo-900 font-medium">{childPart?.part_number}</div>
                            <div className="text-indigo-600 text-xs">{childPart?.description}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-indigo-900">{item.process_step}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-indigo-900">{item.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-indigo-900">{item.setup_time} min</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-indigo-600">{item.cycle_time} min</td>
                          <td className="px-4 py-2 text-sm text-indigo-600">{item.notes}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add BOM Item Form */}
            <form onSubmit={handleAddBOMItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Component</label>
                  <select
                    required
                    className="w-full border border-indigo-200 rounded px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    value={bomFormData.child_part_id}
                    onChange={(e) => setBomFormData({ ...bomFormData, child_part_id: e.target.value })}
                  >
                    <option value="">Select a component</option>
                    {parts
                      .filter(part => part.id !== selectedPart.id)
                      .map(part => (
                        <option key={part.id} value={part.id}>
                          {part.part_number} - {part.description}
                        </option>
                      ))
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Process Step</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-indigo-200 rounded px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    value={bomFormData.process_step}
                    onChange={(e) => setBomFormData({ ...bomFormData, process_step: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    className="w-full border border-indigo-200 rounded px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    value={bomFormData.quantity}
                    onChange={(e) => setBomFormData({ ...bomFormData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Setup Time (minutes)</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0"
                    className="w-full border border-indigo-200 rounded px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    value={bomFormData.setup_time}
                    onChange={(e) => setBomFormData({ ...bomFormData, setup_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Cycle Time (minutes)</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0"
                    className="w-full border border-indigo-200 rounded px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    value={bomFormData.cycle_time}
                    onChange={(e) => setBomFormData({ ...bomFormData, cycle_time: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Notes</label>
                  <textarea
                    className="w-full border border-indigo-200 rounded px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    value={bomFormData.notes}
                    onChange={(e) => setBomFormData({ ...bomFormData, notes: e.target.value })}
                    placeholder="Optional notes about this component"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBOMModal(false);
                    setSelectedPart(null);
                    setBomItems([]);
                  }}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:from-indigo-700 hover:to-purple-700 transition-colors"
                >
                  Add Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
