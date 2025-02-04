// API URL from environment variables - Updated for Google Cloud Run backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import type { Part, Customer, BOMItem, Material, InventoryItem } from '../types';

// This function is used to make API requests to the backend
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    console.log(`Making request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      console.error('API Error:', error);
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`Response from ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch data from API');
  }
}

async function get<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint);
}

async function post<T>(endpoint: string, data: any): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Parts
export async function getParts(): Promise<Part[]> {
  return fetchApi<Part[]>('/parts');
}

export async function createPart(data: Omit<Part, 'id'>): Promise<Part> {
  return fetchApi<Part>('/parts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deletePart(id: number): Promise<void> {
  await fetchApi(`/parts/${id}`, { method: 'DELETE' });
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  return fetchApi<Customer[]>('/customers');
}

export async function createCustomer(data: Omit<Customer, 'id'>): Promise<Customer> {
  return fetchApi<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// BOM Items
export async function getBOMItems(partId: number): Promise<BOMItem[]> {
  return fetchApi<BOMItem[]>(`/parts/${partId}/bom`);
}

export async function createBOMItem(data: Omit<BOMItem, 'id'>): Promise<BOMItem> {
  return fetchApi<BOMItem>('/bom', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Materials
export async function getMaterials(): Promise<Material[]> {
  return fetchApi<Material[]>('/materials');
}

export async function createMaterial(data: Omit<Material, 'id'>): Promise<Material> {
  return fetchApi<Material>('/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Inventory
export async function getInventory(): Promise<InventoryItem[]> {
  return fetchApi<InventoryItem[]>('/inventory');
}

export async function createInventoryItem(data: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  return fetchApi<InventoryItem>('/inventory', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Sales Orders
export async function getSalesOrders(): Promise<any[]> {
  return fetchApi<any[]>('/sales-orders');
}

export { get, post };