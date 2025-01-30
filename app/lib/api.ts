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
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    mode: 'cors',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `API call failed: ${response.statusText}`);
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
  return get<Part[]>('/parts/');
}

export async function getCustomers(): Promise<Customer[]> {
  return get<Customer[]>('/customers/');
}

export async function createCustomer(data: CreateCustomerData): Promise<Customer> {
  return post<Customer>('/customers/', data);
}

export async function createPart(data: CreatePartData): Promise<Part> {
  return post<Part>('/parts/', data);
}

export async function createBOMItem(data: CreateBOMItemData): Promise<BOMItem> {
  return post<BOMItem>('/bom-items/', data);
}

export async function getBOMItems(partId: number): Promise<BOMItem[]> {
  return get<BOMItem[]>(`/parts/${partId}/bom-items`);
}

export async function deletePart(id: number): Promise<void> {
  return del(`/parts/${id}`);
} 