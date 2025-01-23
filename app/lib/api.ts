const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import { BOMItem, Part, Customer } from '../types';

interface CreateBOMItemData {
  parent_part_id: number;
  child_part_id: number;
  quantity: number;
  process_step: string;
  setup_time: number;
  cycle_time: number;
  notes?: string;
}

interface CreatePartData {
  part_number: string;
  description: string;
  customer_id: number;
  material: string;
  price: number;
  cycle_time: number;
  setup_time: number;
  compatible_machines: string[];
}

interface CreateCustomerData {
  name: string;
  address: string;
  phone: string;
  contact_person: string;
  email: string;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

export async function get<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint);
}

export async function post<T>(endpoint: string, data: any): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function put<T>(endpoint: string, data: any): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function del(endpoint: string): Promise<void> {
  await fetchApi(endpoint, {
    method: 'DELETE',
  });
}

export async function getParts(): Promise<Part[]> {
  const response = await fetch(`${API_URL}/parts/`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch parts');
  }

  return response.json();
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch(`${API_URL}/customers/`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch customers');
  }

  return response.json();
}

export async function createCustomer(data: CreateCustomerData): Promise<Customer> {
  const response = await fetch(`${API_URL}/customers/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create customer');
  }

  return response.json();
}

export async function createPart(data: CreatePartData): Promise<Part> {
  const response = await fetch(`${API_URL}/parts/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create part');
  }

  return response.json();
}

export async function createBOMItem(data: CreateBOMItemData): Promise<BOMItem> {
  const response = await fetch(`${API_URL}/bom-items/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create BOM item');
  }

  return response.json();
}

export async function getBOMItems(partId: number): Promise<BOMItem[]> {
  const response = await fetch(`${API_URL}/parts/${partId}/bom-items`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch BOM items');
  }

  return response.json();
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