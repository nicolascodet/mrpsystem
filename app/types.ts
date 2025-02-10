export interface Part {
  id: number;
  part_number: string;
  description: string;
  customer_id: number;
  customer?: Customer;
  material: string;
  price: number;
  cycle_time: number;
  setup_time: number;
  compatible_machines: string[];
}

export interface Customer {
  id: number;
  name: string;
  address: string;
  phone: string;
  contact_person: string;
  email: string;
}

export interface Material {
  id: number;
  name: string;
  type: string;
  supplier_id: number;
  price: number;
  moq: number;
  lead_time_days: number;
  reorder_point: number;
  specifications: Record<string, any>;
}

export interface InventoryItem {
  id: number;
  part_id?: number;
  material_id: number;
  quantity: number;
  batch_number: string;
  location: string;
  status: string;
  expiry_date?: string;
  last_updated?: string;
}

export interface BOMItem {
  id: number;
  parent_part_id: number;
  child_part_id: number;
  quantity: number;
  process_step: string;
  setup_time: number;
  cycle_time: number;
  notes?: string;
}

export interface BOMItemFormData {
  child_part_id: number;
  quantity: number;
  process_step: string;
  setup_time: number;
  cycle_time: number;
  notes: string;
}
