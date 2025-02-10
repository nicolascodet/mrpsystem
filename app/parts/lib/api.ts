import type { Part, Customer, Material, InventoryItem, BOMItem } from '../../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function post(endpoint: string, data: any) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to process request');
  }

  return response.json();
}

export async function getParts(): Promise<Part[]> {
  const response = await fetch(`${API_URL}/parts/`);
  if (!response.ok) throw new Error('Failed to fetch parts');
  return response.json();
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch(`${API_URL}/customers/`);
  if (!response.ok) throw new Error('Failed to fetch customers');
  return response.json();
}

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await fetch(`${API_URL}/inventory/`);
  if (!response.ok) throw new Error('Failed to fetch inventory');
  return response.json();
}

export async function getMaterials(): Promise<Material[]> {
  const response = await fetch(`${API_URL}/materials/`);
  if (!response.ok) throw new Error('Failed to fetch materials');
  return response.json();
}

export async function getBOMItems(partId: number): Promise<BOMItem[]> {
  const response = await fetch(`${API_URL}/bom/${partId}`);
  if (!response.ok) throw new Error('Failed to fetch BOM items');
  return response.json();
}

export async function getSalesOrders(): Promise<any[]> {
  const response = await fetch(`${API_URL}/sales-orders/`);
  if (!response.ok) throw new Error('Failed to fetch sales orders');
  return response.json();
}

export async function createPart(data: Omit<Part, 'id'>): Promise<Part> {
  return post('/parts/', data);
}

export async function createCustomer(data: Omit<Customer, 'id'>): Promise<Customer> {
  return post('/customers/', data);
}

export async function createBOMItem(data: Omit<BOMItem, 'id'>): Promise<BOMItem> {
  return post('/bom/', data);
}

export async function createInventoryItem(data: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  return post('/inventory/', data);
}

export async function createMaterial(data: Omit<Material, 'id'>): Promise<Material> {
  return post('/materials/', data);
}

export async function deletePart(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/parts/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete part');
  }
}
