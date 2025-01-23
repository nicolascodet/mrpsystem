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

export interface Part {
  id: number;
  part_number: string;
  description: string;
  customer: {
    id: number;
    name: string;
  };
  price: number;
  cycle_time: number;
  setup_time: number;
  compatible_machines: string[];
}

export interface BOMItemFormData {
  child_part_id: string;
  quantity: string;
  process_step: string;
  setup_time: string;
  cycle_time: string;
  notes: string;
}

export interface Customer {
  id: number;
  name: string;
  address: string;
  phone: string;
  contact_person: string;
  email: string;
} 