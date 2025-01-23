'use client'

import { useState, useEffect } from 'react'
import { getParts, createProductionRun, getProductionRuns } from '@/lib/api'

interface Part {
  id: number
  part_number: string
  description: string
}

interface FormData {
  part_id: string
  part_number: string
  quantity: number
  status: string
  start_time: string
  end_time: string
  priority: number
  assigned_machine: string
  assigned_operator: string
  actual_setup_time: number
  actual_cycle_time: number
  total_completed: number
  total_defects: number
  notes: string
  batch_number: string
  work_order_number: string
}

const defaultFormData: FormData = {
  part_id: '',
  part_number: '',
  quantity: 0,
  status: 'pending',
  start_time: new Date().toISOString(),
  end_time: '',
  priority: 2,
  assigned_machine: '',
  assigned_operator: '',
  actual_setup_time: 0,
  actual_cycle_time: 0,
  total_completed: 0,
  total_defects: 0,
  notes: '',
  batch_number: '',
  work_order_number: `WO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
}

export default function ProductionRunsPage() {
  const [showForm, setShowForm] = useState(false)
  const [runs, setRuns] = useState([])
  const [parts, setParts] = useState<Part[]>([])
  const [partSearch, setPartSearch] = useState('')
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [formData, setFormData] = useState<FormData>(defaultFormData)

  useEffect(() => {
    fetchRuns()
    loadParts()
  }, [])

  useEffect(() => {
    const filtered = partSearch
      ? parts.filter(part => 
          part.part_number.toLowerCase().includes(partSearch.toLowerCase()) ||
          part.description.toLowerCase().includes(partSearch.toLowerCase()))
      : parts;
    setFilteredParts(filtered);
  }, [partSearch, parts]);

  const loadParts = async () => {
    try {
      const data = await getParts();
      setParts(data);
    } catch (error) {
      console.error('Error loading parts:', error);
    }
  };

  const fetchRuns = async () => {
    try {
      const response = await fetch('http://localhost:8000/production-runs')
      if (response.ok) {
        const data = await response.json()
        setRuns(data)
      }
    } catch (error) {
      console.error('Error fetching runs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.part_id) {
      alert('Please select a part');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/production-runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          part_id: parseInt(formData.part_id),
          quantity: formData.quantity,
          status: formData.status,
          start_time: formData.start_time
        }),
      })
      if (response.ok) {
        alert('Production run created successfully!')
        setShowForm(false)
        setFormData(defaultFormData)
        fetchRuns() // Refresh the list
      }
    } catch (error) {
      alert('Failed to create production run')
    }
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Production Runs</h1>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Production Run
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Part Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Part Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a part number..."
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      !formData.part_id && 'border-red-300'
                    }`}
                    value={partSearch}
                    onChange={(e) => {
                      setPartSearch(e.target.value);
                      if (!e.target.value) {
                        setFormData({ ...formData, part_id: '', part_number: '' });
                      }
                    }}
                    required
                    readOnly={!!formData.part_id}
                  />
                  {formData.part_id && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, part_id: '', part_number: '' });
                        setPartSearch('');
                      }}
                      className="absolute right-0 top-1 px-4 bg-red-500 text-white hover:bg-red-600 rounded-r-md h-[34px]"
                    >
                      ×
                    </button>
                  )}
                </div>
                {!formData.part_id && (
                  <p className="mt-1 text-sm text-red-500">
                    Please select a part from the list
                  </p>
                )}
                {partSearch && filteredParts.length > 0 && !formData.part_id && (
                  <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredParts.map((part) => (
                      <div
                        key={part.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            part_id: part.id.toString(),
                            part_number: part.part_number
                          });
                          setPartSearch(`${part.part_number} - ${part.description}`);
                          setFilteredParts([]);
                        }}
                      >
                        <div className="font-medium">{part.part_number}</div>
                        <div className="text-sm text-gray-500">{part.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Order Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Work Order Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.work_order_number}
                  onChange={(e) => setFormData({...formData, work_order_number: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  readOnly
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="1"
                />
              </div>

              {/* Batch Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Optional - Enter batch number"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value={1}>1 - Highest</option>
                  <option value={2}>2 - High</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - Low</option>
                  <option value={5}>5 - Lowest</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time.slice(0, 16)}
                  onChange={(e) => setFormData({...formData, start_time: new Date(e.target.value).toISOString()})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time ? formData.end_time.slice(0, 16) : ''}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Assigned Machine */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assigned Machine
                </label>
                <input
                  type="text"
                  value={formData.assigned_machine}
                  onChange={(e) => setFormData({...formData, assigned_machine: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter machine name/number"
                />
              </div>

              {/* Assigned Operator */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assigned Operator
                </label>
                <input
                  type="text"
                  value={formData.assigned_operator}
                  onChange={(e) => setFormData({...formData, assigned_operator: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter operator name"
                />
              </div>

              {/* Setup Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Actual Setup Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.actual_setup_time}
                  onChange={(e) => setFormData({...formData, actual_setup_time: parseFloat(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* Cycle Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Actual Cycle Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.actual_cycle_time}
                  onChange={(e) => setFormData({...formData, actual_cycle_time: parseFloat(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* Total Completed */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Completed
                </label>
                <input
                  type="number"
                  value={formData.total_completed}
                  onChange={(e) => setFormData({...formData, total_completed: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </div>

              {/* Total Defects */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Defects
                </label>
                <input
                  type="number"
                  value={formData.total_defects}
                  onChange={(e) => setFormData({...formData, total_defects: parseInt(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Enter any additional notes or instructions"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Production Run
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid gap-4">
        {runs.map((run: any, index: number) => (
          <div key={index} className="bg-white shadow rounded-lg p-6">
            <h3 className="font-bold mb-2">{run.part_number}</h3>
            <div className="space-y-1 text-sm">
              <p>Quantity: {run.quantity}</p>
              <p>Status: {run.status}</p>
              {run.start_date && <p>Start Date: {new Date(run.start_date).toLocaleDateString()}</p>}
              {run.end_date && <p>End Date: {new Date(run.end_date).toLocaleDateString()}</p>}
            </div>
          </div>
        ))}
        {runs.length === 0 && (
          <p className="text-gray-500 text-center">No production runs available</p>
        )}
      </div>
    </main>
  )
} 