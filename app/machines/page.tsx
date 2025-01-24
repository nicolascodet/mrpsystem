'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import { getMachines, getMaintenanceRecords, createMachine, createMaintenanceRecord } from '@/lib/api';

interface Machine {
  id: number;
  name: string;
  model: string;
  manufacturer: string;
  installation_date: string;
  last_maintenance: string;
  status: string;
  specifications: Record<string, any>;
}

interface MaintenanceRecord {
  id: number;
  machine_id: number;
  date: string;
  type: string;
  description: string;
  technician: string;
  cost: number;
  status: string;
  next_maintenance_date: string;
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState(false);
  const [isAddMaintenanceModalOpen, setIsAddMaintenanceModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [machinesData, maintenanceData] = await Promise.all([
        getMachines(),
        getMaintenanceRecords()
      ]);
      setMachines(machinesData);
      setMaintenanceRecords(maintenanceData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  }

  async function handleAddMachine(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = {
        name: formData.get('name') as string,
        status: true,  // default to operational
        current_shifts: 1,  // default value
        hours_per_shift: 8,  // default value
        current_job: undefined  // optional field
      };

      await createMachine(data);
      setIsAddMachineModalOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to add machine');
    }
  }

  async function handleAddMaintenanceRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = {
        machine_id: parseInt(formData.get('machine_id') as string),
        date: formData.get('date') as string,
        type: formData.get('type') as string,
        description: formData.get('description') as string,
        technician: formData.get('technician') as string,
        cost: parseFloat(formData.get('cost') as string),
        status: formData.get('status') as string,
        next_maintenance_date: formData.get('next_maintenance_date') as string,
      };

      await createMaintenanceRecord(data);
      setIsAddMaintenanceModalOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to add maintenance record');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-indigo-600 font-medium">Loading machine data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Machines
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <TabGroup>
        <TabList className="mt-8">
          <Tab>Machines</Tab>
          <Tab>Maintenance Records</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <div className="mt-4">
              <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-100">
                <div className="flex justify-between items-center mb-6">
                  <Title className="text-indigo-900">Machine List</Title>
                  <button
                    onClick={() => setIsAddMachineModalOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Add Machine
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-indigo-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Manufacturer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Installation Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Last Maintenance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100">
                      {machines.map((machine) => (
                        <tr key={machine.id} className="hover:bg-indigo-50/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">{machine.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{machine.model}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{machine.manufacturer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                            {new Date(machine.installation_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                            {new Date(machine.last_maintenance).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${machine.status === 'operational' ? 'bg-green-100 text-green-800' :
                                machine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}`}>
                              {machine.status}
                            </span>
                          </td>
                        </tr>
                      ))}
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
                  <Title className="text-indigo-900">Maintenance Records</Title>
                  <button
                    onClick={() => setIsAddMaintenanceModalOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Add Record
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-indigo-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Machine</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Technician</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Next Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100">
                      {maintenanceRecords.map((record) => {
                        const machine = machines.find(m => m.id === record.machine_id);
                        return (
                          <tr key={record.id} className="hover:bg-indigo-50/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">{machine?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{record.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{record.technician}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">${record.cost.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${record.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
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
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Add Machine Modal */}
      {isAddMachineModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Add Machine</h2>
            <form onSubmit={handleAddMachine} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddMachineModalOpen(false)}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:from-indigo-700 hover:to-purple-700"
                >
                  Add Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Maintenance Record Modal */}
      {isAddMaintenanceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Add Maintenance Record</h2>
            <form onSubmit={handleAddMaintenanceRecord} className="space-y-4">
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
                      {machine.name} - {machine.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Type</label>
                <select
                  name="type"
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
                <label className="block text-sm font-medium text-indigo-900 mb-1">Technician</label>
                <input
                  type="text"
                  name="technician"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Cost</label>
                <input
                  type="number"
                  name="cost"
                  required
                  min="0"
                  step="0.01"
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
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Next Maintenance Date</label>
                <input
                  type="date"
                  name="next_maintenance_date"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddMaintenanceModalOpen(false)}
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