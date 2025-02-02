'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import type { Material, InventoryItem } from '../types';
import { useStore } from '../lib/store';
import { LoadingPage, LoadingSpinner } from '../components/ui/loading';

export default function InventoryPage() {
  // Global state
  const {
    materials,
    inventory,
    loading,
    error: globalError,
    fetchAllData,
    addInventoryItem,
    addMaterial
  } = useStore();

  // Local state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

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

      await addInventoryItem(data);
      setIsAddModalOpen(false);
      setFormError(null);
    } catch (err: any) {
      setFormError(err.message);
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

      await addMaterial(data);
      setIsAddMaterialModalOpen(false);
      setFormError(null);
    } catch (err: any) {
      setFormError(err.message);
    }
  }

  if (loading) {
    return <LoadingPage />;
  }

  if (globalError) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {globalError}
        </div>
      </div>
    );
  }

  return (
    // ... rest of the component remains the same ...
    <button
      type="submit"
      disabled={isSubmitting}
      className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center min-w-[100px]
        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isSubmitting ? (
        <LoadingSpinner />
      ) : (
        'Add Item'
      )}
    </button>
    // ... rest of the component remains the same ...
    <button
      type="submit"
      disabled={isSubmitting}
      className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center min-w-[100px]
        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isSubmitting ? (
        <LoadingSpinner />
      ) : (
        'Add Material'
      )}
    </button>
    // ... rest of the component remains the same ...
  );
}