const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const defaultOptions = {
  headers: defaultHeaders,
  mode: 'cors' as RequestMode
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(errorData?.detail || `API Error: ${response.statusText}`);
  }
  return response.json();
}

// Parts API
export async function getParts() {
  const response = await fetch(`${API_URL}/parts`, defaultOptions);
  return handleResponse(response);
}

export async function createPart(data: { 
  part_number: string;
  description: string;
  customer_id: number;
  material: string;
  cycle_time: number;
  price: number;
  compatible_machines: string[];
  setup_time: number;
}) {
  const response = await fetch(`${API_URL}/parts/`, { ...defaultOptions, method: 'POST', body: JSON.stringify(data) });
  return handleResponse(response);
}

export async function updatePart(id: number, data: any) {
  const response = await fetch(`${API_URL}/parts/${id}`, { ...defaultOptions, method: 'PUT', body: JSON.stringify(data) });
  return handleResponse(response);
}

export async function deletePart(id: number) {
  const response = await fetch(`${API_URL}/parts/${id}`, { ...defaultOptions, method: 'DELETE' });
  return handleResponse(response);
}

// Production Runs API
export async function getProductionRuns() {
  const response = await fetch(`${API_URL}/production-runs`, defaultOptions);
  return handleResponse(response);
}

export async function createProductionRun(data: {
  part_id: number;
  quantity: number;
  start_time: string;
  status: string;
}) {
  const response = await fetch(`${API_URL}/production-runs`, { ...defaultOptions, method: 'POST', body: JSON.stringify(data) });
  return handleResponse(response);
}

// Quality Checks API
export async function getQualityChecks() {
  const response = await fetch(`${API_URL}/quality-checks`, defaultOptions);
  return handleResponse(response);
}

export async function createQualityCheck(data: {
  part_id: number;
  quantity_checked: number;
  quantity_rejected: number;
  notes?: string;
  status: string;
}) {
  const response = await fetch(`${API_URL}/quality-checks`, { ...defaultOptions, method: 'POST', body: JSON.stringify(data) });
  return handleResponse(response);
}

// Materials API
export async function getMaterials() {
  const response = await fetch(`${API_URL}/materials`, defaultOptions);
  return handleResponse(response);
}

export async function createMaterial(data: {
  name: string;
  type: string;
  supplier_id: number;
  price: number;
  moq: number;
  lead_time_days: number;
  reorder_point: number;
  specifications: Record<string, any>;
}) {
  const response = await fetch(`${API_URL}/materials`, { ...defaultOptions, method: 'POST', body: JSON.stringify(data) });
  return handleResponse(response);
}

// Inventory API
export async function getInventory() {
  const response = await fetch(`${API_URL}/inventory`, defaultOptions);
  return handleResponse(response);
}

export async function createInventoryItem(data: {
  material_id: number;
  batch_number: string;
  quantity: number;
  location: string;
  status: string;
  expiry_date?: string;
}) {
  const response = await fetch(`${API_URL}/inventory`, { ...defaultOptions, method: 'POST', body: JSON.stringify(data) });
  return handleResponse(response);
}

// Suppliers API
export async function getSuppliers() {
  const response = await fetch(`${API_URL}/suppliers`, defaultOptions);
  return handleResponse(response);
}

export async function createSupplier(data: {
  name: string;
  contact_info: Record<string, any>;
  lead_time_days: number;
  rating: number;
  active: boolean;
}) {
  const response = await fetch(`${API_URL}/suppliers`, { ...defaultOptions, method: 'POST', body: JSON.stringify(data) });
  return handleResponse(response);
}

// Machines API
export async function getMachines() {
  const response = await fetch(`${API_URL}/machines`, defaultOptions);
  return handleResponse(response);
}

export async function createMachine(data: {
  name: string;
  status: boolean;
  current_shifts: number;
  hours_per_shift: number;
  current_job?: string;
}) {
  const response = await fetch(`${API_URL}/machines`, { ...defaultOptions, method: 'POST', body: JSON.stringify(data) });
  return handleResponse(response);
}

// Maintenance Records API
export async function getMaintenanceRecords() {
  const response = await fetch(`${API_URL}/maintenance-records`, defaultOptions);
  return handleResponse(response);
}

export async function createMaintenanceRecord(data: {
  machine_id: number;
  type: string;
  description: string;
  start_time: string;
  end_time?: string;
  technician: string;
  parts_used: string;
  cost: number;
  status: string;
}) {
  const response = await fetch(`${API_URL}/maintenance-records`, { ...defaultOptions, method: 'POST', body: JSON.stringify(data) });
  return handleResponse(response);
}

// BOM API
export async function getBOMItems(partId: number) {
  const response = await fetch(`${API_URL}/parts/${partId}/bom`, defaultOptions);
  return handleResponse(response);
}

export async function createBOMItem(data: {
  parent_part_id: number;
  child_part_id: number;
  quantity: number;
  process_step: string;
  setup_time: number;
  cycle_time: number;
  notes?: string;
}) {
  const response = await fetch(`${API_URL}/bom-items`, { ...defaultOptions, method: 'POST', body: JSON.stringify(data) });
  return handleResponse(response);
}

// Customer API
export async function getCustomers(search?: string) {
  const searchParams = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await fetch(`${API_URL}/customers${searchParams}`, defaultOptions);
  return handleResponse(response);
}

export async function createCustomer(data: {
  name: string;
  address: string;
  phone: string;
  contact_person: string;
  email: string;
}) {
  const response = await fetch(`${API_URL}/customers`, { ...defaultOptions, method: 'POST', body: JSON.stringify(data) });
  return handleResponse(response);
}

export async function getCustomer(id: number) {
  const response = await fetch(`${API_URL}/customers/${id}`, defaultOptions);
  return handleResponse(response);
}