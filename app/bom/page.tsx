'use client';

import { useState, useEffect } from 'react';
import { getBOMItems, createBOMItem, getParts } from '@/lib/api';
import { Card, Title } from '@tremor/react';

export default function BOMPage() {
  const [bomItems, setBOMItems] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [partsData] = await Promise.all([
        getParts()
      ]);
      setParts(partsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load parts data');
      setLoading(false);
    }
  }

  async function loadBOMItems(partId: number) {
    try {
      const data = await getBOMItems(partId);
      setBOMItems(data);
      setSelectedPartId(partId);
    } catch (err) {
      setError('Failed to load BOM items');
    }
  }

  async function handleAddBOMItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = {
        parent_part_id: selectedPartId!,
        child_part_id: parseInt(formData.get('child_part_id') as string),
        quantity: parseInt(formData.get('quantity') as string),
        process_step: formData.get('process_step') as string,
        setup_time: parseFloat(formData.get('setup_time') as string),
        cycle_time: parseFloat(formData.get('cycle_time') as string),
        notes: formData.get('notes') as string || undefined
      };

      await createBOMItem(data);
      setIsAddModalOpen(false);
      if (selectedPartId) {
        loadBOMItems(selectedPartId);
      }
    } catch (err) {
      setError('Failed to add BOM item');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-indigo-600 font-medium">Loading parts data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Bill of Materials
        </h1>
        {selectedPartId && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Add Component
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-100 md:col-span-1">
          <Title className="text-indigo-900 mb-4">Select Part</Title>
          <div className="space-y-2">
            {parts.map((part) => (
              <button
                key={part.id}
                onClick={() => loadBOMItems(part.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                  selectedPartId === part.id
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-indigo-50'
                }`}
              >
                <div className="font-medium">{part.part_number}</div>
                <div className="text-sm opacity-80">{part.description}</div>
              </button>
            ))}
          </div>
        </Card>

        {selectedPartId && (
          <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-100 md:col-span-2">
            <Title className="text-indigo-900 mb-4">Components List</Title>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-indigo-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Component</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Process Step</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Setup Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Cycle Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {bomItems.map((item) => {
                    const childPart = parts.find(p => p.id === item.child_part_id);
                    return (
                      <tr key={item.id} className="hover:bg-indigo-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-indigo-900 font-medium">{childPart?.part_number}</div>
                          <div className="text-indigo-600 text-xs">{childPart?.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{item.process_step}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">{item.setup_time} min</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{item.cycle_time} min</td>
                        <td className="px-6 py-4 text-sm text-indigo-600">{item.notes}</td>
                      </tr>
                    );
                  })}
                  {bomItems.length > 0 && (
                    <tr className="bg-indigo-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">
                        {bomItems.reduce((sum, item) => sum + item.quantity, 0)} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900"></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">
                        ${bomItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {isAddModalOpen && selectedPartId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Add Component</h2>
            <form onSubmit={handleAddBOMItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Component</label>
                <select
                  name="child_part_id"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                >
                  <option value="">Select a component</option>
                  {parts
                    .filter(part => part.id !== selectedPartId)
                    .map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.part_number} - {part.description}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="1"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Process Step</label>
                <input
                  type="text"
                  name="process_step"
                  required
                  placeholder="e.g., Assembly, Welding, Painting"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Setup Time (minutes)</label>
                <input
                  type="number"
                  name="setup_time"
                  required
                  step="0.1"
                  min="0"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Cycle Time (minutes)</label>
                <input
                  type="number"
                  name="cycle_time"
                  required
                  step="0.1"
                  min="0"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Notes</label>
                <textarea
                  name="notes"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
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
                  Add Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 