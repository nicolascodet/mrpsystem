'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Grid, Col } from '@tremor/react'

interface QualityCheck {
  id: number
  part_id: number
  production_run_id?: number
  quantity_checked: number
  quantity_rejected: number
  defect_categories?: { [key: string]: number }
  defect_locations?: string[]
  corrective_actions?: string
  inspector?: string
  notes?: string
  status: string
  check_date: string
  part: {
    part_number: string
    description: string
  }
}

export default function QualityChecksPage() {
  const [showForm, setShowForm] = useState(false)
  const [checks, setChecks] = useState<QualityCheck[]>([])
  const [formData, setFormData] = useState({
    part_id: 0,
    production_run_id: '',
    quantity_checked: 0,
    quantity_rejected: 0,
    defect_categories: '',  // Will be converted to JSON before sending
    defect_locations: '',   // Will be converted to array before sending
    corrective_actions: '',
    inspector: '',
    notes: '',
    status: 'pending'
  })
  const [parts, setParts] = useState<any[]>([])
  const [productionRuns, setProductionRuns] = useState<any[]>([])

  useEffect(() => {
    fetchChecks()
    fetchParts()
    fetchProductionRuns()
  }, [])

  const fetchChecks = async () => {
    try {
      const response = await fetch('http://localhost:8000/quality-checks')
      if (response.ok) {
        const data = await response.json()
        setChecks(data)
      }
    } catch (error) {
      console.error('Error fetching checks:', error)
    }
  }

  const fetchParts = async () => {
    try {
      const response = await fetch('http://localhost:8000/parts/')
      if (response.ok) {
        const data = await response.json()
        setParts(data)
      }
    } catch (error) {
      console.error('Error fetching parts:', error)
    }
  }

  const fetchProductionRuns = async () => {
    try {
      const response = await fetch('http://localhost:8000/production-runs')
      if (response.ok) {
        const data = await response.json()
        setProductionRuns(data)
      }
    } catch (error) {
      console.error('Error fetching production runs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert string inputs to proper format
      const defectCategories = formData.defect_categories ? 
        JSON.parse(formData.defect_categories) : null
      const defectLocations = formData.defect_locations ? 
        formData.defect_locations.split(',').map(s => s.trim()) : null
      
      const submitData = {
        ...formData,
        defect_categories: defectCategories,
        defect_locations: defectLocations,
        production_run_id: formData.production_run_id ? parseInt(formData.production_run_id) : null
      }

      const response = await fetch('http://localhost:8000/quality-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        alert('Quality check created successfully!')
        setShowForm(false)
        setFormData({
          part_id: 0,
          production_run_id: '',
          quantity_checked: 0,
          quantity_rejected: 0,
          defect_categories: '',
          defect_locations: '',
          corrective_actions: '',
          inspector: '',
          notes: '',
          status: 'pending'
        })
        fetchChecks()
      }
    } catch (error) {
      alert('Failed to create quality check')
      console.error(error)
    }
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <Title>Quality Checks</Title>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Quality Check
        </button>
      </div>
      
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
              <Col>
                <label className="block text-sm font-medium mb-1">Part</label>
                <select
                  value={formData.part_id}
                  onChange={(e) => setFormData({...formData, part_id: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a part</option>
                  {parts.map(part => (
                    <option key={part.id} value={part.id}>
                      {part.part_number} - {part.description}
                    </option>
                  ))}
                </select>
              </Col>

              <Col>
                <label className="block text-sm font-medium mb-1">Production Run (Optional)</label>
                <select
                  value={formData.production_run_id}
                  onChange={(e) => setFormData({...formData, production_run_id: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a production run</option>
                  {productionRuns.map(run => (
                    <option key={run.id} value={run.id}>
                      {run.work_order_number} - Qty: {run.quantity}
                    </option>
                  ))}
                </select>
              </Col>

              <Col>
                <label className="block text-sm font-medium mb-1">Inspector</label>
                <input
                  type="text"
                  value={formData.inspector}
                  onChange={(e) => setFormData({...formData, inspector: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Name of inspector"
                />
              </Col>

              <Col>
                <label className="block text-sm font-medium mb-1">Quantity Checked</label>
                <input
                  type="number"
                  value={formData.quantity_checked}
                  onChange={(e) => setFormData({...formData, quantity_checked: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="0"
                  required
                />
              </Col>

              <Col>
                <label className="block text-sm font-medium mb-1">Quantity Rejected</label>
                <input
                  type="number"
                  value={formData.quantity_rejected}
                  onChange={(e) => setFormData({...formData, quantity_rejected: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="0"
                  required
                />
              </Col>

              <Col>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </Col>

              <Col numColSpan={2}>
                <label className="block text-sm font-medium mb-1">Defect Categories (JSON)</label>
                <input
                  type="text"
                  value={formData.defect_categories}
                  onChange={(e) => setFormData({...formData, defect_categories: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder='{"scratch": 5, "dent": 2}'
                />
              </Col>

              <Col>
                <label className="block text-sm font-medium mb-1">Defect Locations</label>
                <input
                  type="text"
                  value={formData.defect_locations}
                  onChange={(e) => setFormData({...formData, defect_locations: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="top_surface, edge, bottom"
                />
              </Col>

              <Col numColSpan={3}>
                <label className="block text-sm font-medium mb-1">Corrective Actions</label>
                <textarea
                  value={formData.corrective_actions}
                  onChange={(e) => setFormData({...formData, corrective_actions: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={2}
                  placeholder="Describe any corrective actions taken"
                />
              </Col>

              <Col numColSpan={3}>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </Col>
            </Grid>

            <div className="flex space-x-2">
              <button 
                type="submit" 
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Create
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)} 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
        {checks.map((check) => (
          <Card key={check.id} className="space-y-2">
            <Title>{check.part.part_number}</Title>
            <Text>{check.part.description}</Text>
            <div className="space-y-1 text-sm">
              <p>Status: <span className={`font-bold ${
                check.status === 'passed' ? 'text-green-600' :
                check.status === 'failed' ? 'text-red-600' :
                'text-yellow-600'
              }`}>{check.status}</span></p>
              <p>Quantity: {check.quantity_checked} checked, {check.quantity_rejected} rejected</p>
              <p>Inspector: {check.inspector || 'Not specified'}</p>
              <p>Date: {new Date(check.check_date).toLocaleString()}</p>
              {check.defect_categories && (
                <div>
                  <p className="font-semibold">Defects:</p>
                  <ul className="list-disc list-inside">
                    {Object.entries(check.defect_categories).map(([type, count]) => (
                      <li key={type}>{type}: {count}</li>
                    ))}
                  </ul>
                </div>
              )}
              {check.defect_locations && check.defect_locations.length > 0 && (
                <p>Locations: {check.defect_locations.join(', ')}</p>
              )}
              {check.corrective_actions && (
                <p>Corrective Actions: {check.corrective_actions}</p>
              )}
              {check.notes && <p>Notes: {check.notes}</p>}
            </div>
          </Card>
        ))}
      </Grid>
      
      {checks.length === 0 && (
        <Card>
          <Text className="text-center">No quality checks available</Text>
        </Card>
      )}
    </main>
  )
} 