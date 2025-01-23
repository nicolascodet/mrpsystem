'use client';

import { useState, useEffect } from 'react';
import { getMaintenanceRecords, createMaintenanceRecord, getMachines } from '@/lib/api';
import { Card, Title } from '@tremor/react';

export default function MaintenancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [recordsData, machinesData] = await Promise.all([
        getMaintenanceRecords(),
        getMachines()
      ]);
      setRecords(recordsData);
      setMachines(machinesData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load maintenance data');
      setLoading(false);
    }
  }

  async function handleAddRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = {
        machine_id: parseInt(formData.get('machine_id') as string),
        type: formData.get('maintenance_type') as string,
        description: formData.get('description') as string,
        start_time: new Date(formData.get('start_time') as string).toISOString(),
        end_time: formData.get('end_time') ? new Date(formData.get('end_time') as string).toISOString() : undefined,
        technician: formData.get('technician') as string,
        parts_used: formData.get('parts_used') as string,
        cost: parseFloat(formData.get('cost') as string),
        status: formData.get('status') as string,
      };

      await createMaintenanceRecord(data);
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to add maintenance record');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-indigo-600 font-medium">Loading maintenance records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Maintenance Records
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          Add Record
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-100">
          <Title className="text-indigo-900 mb-4">Maintenance History</Title>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-indigo-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Machine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Performed By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Next Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {records.map((record) => {
                  const machine = machines.find(m => m.id === record.machine_id);
                  return (
                    <tr key={record.id} className="hover:bg-indigo-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">{machine?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{record.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">
                        {new Date(record.start_time).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{record.technician}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">${record.cost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${record.status === 'completed' ? 'bg-green-100 text-green-800' :
                            record.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        {new Date(record.next_maintenance_date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Add Maintenance Record</h2>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Machine</label>
                <select
                  name="machine_id"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                >
                  <option value="">Select a machine</option>
                  {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Maintenance Type</label>
                <select
                  name="maintenance_type"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                >
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="predictive">Predictive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">End Time (Optional)</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Technician</label>
                <input
                  type="text"
                  name="technician"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Parts Used</label>
                <textarea
                  name="parts_used"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                  placeholder="List parts used, separated by commas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Cost</label>
                <input
                  type="number"
                  name="cost"
                  required
                  step="0.01"
                  min="0"
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
                  <option value="completed">Completed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
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
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 