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

export interface SalesOrder {
  id: number;
  order_number: string;
  customer: {
    id: number;
    name: string;
  };
  due_date: string;
  status: string;
  total_amount: number;
  payment_terms: string;
  shipping_address: string;
  notes?: string;
  line_items: Array<{
    id: number;
    part_id: number;
    quantity: number;
    unit_price: number;
    delivered_quantity: number;
    total_amount: number;
    part: {
      part_number: string;
      description: string;
    };
  }>;
} 