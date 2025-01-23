'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import { getInventory, getMaterials, createInventoryItem, createMaterial } from '@/lib/api';

interface Material {
  id: number;
  name: string;
  type: string;
  supplier_id: number;
  price: number;
  moq: number;
  lead_time_days: number;
  reorder_point: number;
  specifications: Record<string, any>;
}

interface InventoryItem {
  id: number;
  material_id: number;
  batch_number: string;
  quantity: number;
  location: string;
  expiry_date?: string;
  status: string;
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [inventoryData, materialsData] = await Promise.all([
        getInventory(),
        getMaterials()
      ]);
      setInventory(inventoryData);
      setMaterials(materialsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  }

  async function handleAddInventoryItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = {
        material_id: parseInt(formData.get('material_id') as string),
        batch_number: formData.get('batch_number') as string,
        quantity: parseFloat(formData.get('quantity') as string),
        location: formData.get('location') as string,
        expiry_date: formData.get('expiry_date') as string || undefined,
        status: formData.get('status') as string,
      };

      await createInventoryItem(data);
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to add inventory item');
    }
  }

  async function handleAddMaterial(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = {
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        supplier_id: parseInt(formData.get('supplier_id') as string),
        price: parseFloat(formData.get('price') as string),
        moq: parseFloat(formData.get('moq') as string),
        lead_time_days: parseInt(formData.get('lead_time_days') as string),
        reorder_point: parseFloat(formData.get('reorder_point') as string),
        specifications: JSON.parse(formData.get('specifications') as string || '{}'),
      };

      await createMaterial(data);
      setIsAddMaterialModalOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to add material');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-indigo-600 font-medium">Loading inventory data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Inventory & Materials
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <TabGroup>
        <TabList className="mt-8">
          <Tab>Inventory</Tab>
          <Tab>Materials</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <div className="mt-4">
              <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-100">
                <div className="flex justify-between items-center mb-6">
                  <Title className="text-indigo-900">Inventory Items</Title>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Add Item
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-indigo-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Material</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Batch Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100">
                      {inventory.map((item) => {
                        const material = materials.find(m => m.id === item.material_id);
                        return (
                          <tr key={item.id} className="hover:bg-indigo-50/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="text-indigo-900 font-medium">{material?.name}</div>
                              <div className="text-indigo-600 text-xs">{material?.type}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">{item.batch_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{item.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{item.status}</td>
                          </tr>
                        );
                      })}
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
                  <Title className="text-indigo-900">Materials</Title>
                  <button
                    onClick={() => setIsAddMaterialModalOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Add Material
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-indigo-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">MOQ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Lead Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Reorder Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100">
                      {materials.map((material) => (
                        <tr key={material.id} className="hover:bg-indigo-50/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">{material.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{material.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">${material.price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{material.moq}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{material.lead_time_days} days</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{material.reorder_point}</td>
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

      {/* Add Inventory Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Add Inventory Item</h2>
            <form onSubmit={handleAddInventoryItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Material</label>
                <select
                  name="material_id"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                >
                  <option value="">Select a material</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} - {material.type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Batch Number</label>
                <input
                  type="text"
                  name="batch_number"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Status</label>
                <select
                  name="status"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="in_use">In Use</option>
                  <option value="depleted">Depleted</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:from-indigo-700 hover:to-purple-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Add Material</h2>
            <form onSubmit={handleAddMaterial} className="space-y-4">
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
                <label className="block text-sm font-medium text-indigo-900 mb-1">Type</label>
                <input
                  type="text"
                  name="type"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Supplier</label>
                <select
                  name="supplier_id"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                >
                  <option value="">Select a supplier</option>
                  {/* TODO: Add supplier options */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Minimum Order Quantity</label>
                <input
                  type="number"
                  name="moq"
                  required
                  min="0"
                  step="0.01"
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
                <label className="block text-sm font-medium text-indigo-900 mb-1">Reorder Point</label>
                <input
                  type="number"
                  name="reorder_point"
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Specifications (JSON)</label>
                <textarea
                  name="specifications"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                  placeholder="{}"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:from-indigo-700 hover:to-purple-700"
                >
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 