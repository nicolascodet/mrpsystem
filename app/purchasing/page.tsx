'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import { getSuppliers, createSupplier } from '@/lib/api';

interface Supplier {
  id: number;
  name: string;
  contact_info: {
    contact_person: string;
    email: string;
    phone: string;
    address: string;
  };
  lead_time_days: number;
  rating: number;
  active: boolean;
}

interface SupplierFormData {
  name: string;
  contact_info: {
    contact_person: string;
    email: string;
    phone: string;
    address: string;
  };
  lead_time_days: number;
  rating: number;
  active: boolean;
}

export default function PurchasingPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const suppliersData = await getSuppliers();
      setSuppliers(suppliersData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  }

  async function handleAddSupplier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = {
        name: formData.get('name') as string,
        contact_info: {
          contact_person: formData.get('contact_person') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          address: formData.get('address') as string,
        },
        lead_time_days: parseInt(formData.get('lead_time_days') as string) || 0,
        rating: parseInt(formData.get('rating') as string) || 5,
        active: true,
      };

      await createSupplier(data);
      setIsAddSupplierModalOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to add supplier');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-indigo-600 font-medium">Loading purchasing data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Purchasing
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <TabGroup>
        <TabList className="mt-8">
          <Tab>Purchase Orders</Tab>
          <Tab>Suppliers</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <div className="mt-4">
              <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-100">
                <div className="flex justify-between items-center mb-6">
                  <Title className="text-indigo-900">Purchase Orders</Title>
                  <button
                    onClick={() => {/* TODO: Add PO modal */}}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Create PO
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-indigo-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">PO Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100">
                      {/* TODO: Add PO list */}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="mt-4">
              <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-100">
                <div className="flex justify-between items-center mb-6">
                  <Title className="text-indigo-900">Suppliers</Title>
                  <button
                    onClick={() => setIsAddSupplierModalOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Add Supplier
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-indigo-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Contact Person</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100">
                      {suppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-indigo-50/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">{supplier.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{supplier.contact_info.contact_person}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{supplier.contact_info.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{supplier.contact_info.phone}</td>
                          <td className="px-6 py-4 text-sm text-indigo-600">{supplier.contact_info.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Add Supplier Modal */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Add Supplier</h2>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Address</label>
                <textarea
                  name="address"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Lead Time (Days)</label>
                <input
                  type="number"
                  name="lead_time_days"
                  required
                  min="0"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  name="rating"
                  required
                  min="1"
                  max="5"
                  defaultValue="5"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:from-indigo-700 hover:to-purple-700"
                >
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 