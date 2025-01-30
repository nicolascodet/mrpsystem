export interface BOMItem {
  id: number;
  parent_part_id: number;
  child_part_id: number;
  quantity: number;
  process_step: string;
  setup_time: number;
  cycle_time: number;
  notes?: string;
  child_part?: Part;
}

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
  contact_person: string;
  email: string;
  phone: string;
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

export interface ProductionRun {
  id: number;
  run_number: string;
  sales_order_id: number;
  part_id: number;
  quantity: number;
  start_date: string;
  end_date: string;
  status: string;
  notes?: string;
  part?: Part;
  sales_order?: SalesOrder;
}

export interface Machine {
  id: number;
  name: string;
  type: string;
  status: string;
  location: string;
  maintenance_schedule: string;
  last_maintenance: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: number;
  machine_id: number;
  maintenance_date: string;
  type: string;
  description: string;
  technician: string;
  cost: number;
  status: string;
  next_maintenance_date: string;
  notes?: string;
  machine?: Machine;
}

export interface QualityCheck {
  id: number;
  check_number: string;
  production_run_id: number;
  inspector: string;
  check_date: string;
  status: string;
  measurements: {
    [key: string]: number;
  };
  notes?: string;
  production_run?: ProductionRun;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  order_date: string;
  expected_delivery: string;
  status: string;
  total_amount: number;
  notes?: string;
  line_items: Array<{
    id: number;
    material_id: number;
    quantity: number;
    unit_price: number;
    received_quantity: number;
    total_amount: number;
  }>;
} 