import { create } from 'zustand';
import { getParts, getCustomers, getInventory, getMaterials, createInventoryItem, createMaterial, getBOMItems, getSalesOrders, post } from './api';
import type { Part, Customer, Material, InventoryItem } from '../../types';

interface AppState {
  parts: Part[];
  customers: Customer[];
  inventory: InventoryItem[];
  materials: Material[];
  salesOrders: any[];
  bomItems: Record<number, any[]>;
  loading: boolean;
  error: string | null;

  fetchAllData: () => Promise<void>;
  fetchParts: () => Promise<void>;
  fetchBOMItems: (partId: number) => Promise<void>;
  addPart: (part: Part) => void;
  addCustomer: (customer: Customer) => void;
  addBOMItem: (parentId: number, item: any) => void;
  deletePart: (id: number) => void;
  addInventoryItem: (data: Omit<InventoryItem, 'id'>) => Promise<InventoryItem>;
  addMaterial: (data: Omit<Material, 'id'>) => Promise<Material>;
  addSalesOrder: (data: any) => Promise<void>;
  updateSalesOrder: (id: number, data: any) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  parts: [],
  customers: [],
  inventory: [],
  materials: [],
  salesOrders: [],
  bomItems: {},
  loading: true,
  error: null,

  fetchAllData: async () => {
    try {
      const [partsData, customersData, inventoryData, materialsData, salesOrdersData] = await Promise.all([
        getParts(),
        getCustomers(),
        getInventory(),
        getMaterials(),
        getSalesOrders()
      ]);

      set({
        parts: partsData,
        customers: customersData,
        inventory: inventoryData,
        materials: materialsData,
        salesOrders: salesOrdersData,
        loading: false,
        error: null
      });
    } catch (error) {
      set({ error: 'Failed to fetch data', loading: false });
    }
  },

  fetchParts: async () => {
    try {
      const partsData = await getParts();
      set({ parts: partsData, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch parts' });
    }
  },

  addInventoryItem: async (data) => {
    try {
      const newItem = await createInventoryItem(data);
      set(state => ({
        inventory: [...state.inventory, newItem],
        error: null
      }));
      return newItem;
    } catch (error) {
      set({ error: 'Failed to add inventory item' });
      throw error;
    }
  },

  addMaterial: async (data) => {
    try {
      const newMaterial = await createMaterial(data);
      set(state => ({
        materials: [...state.materials, newMaterial],
        error: null
      }));
      return newMaterial;
    } catch (error) {
      set({ error: 'Failed to add material' });
      throw error;
    }
  },

  addSalesOrder: async (data) => {
    try {
      const response = await post('/sales-orders/', data);
      set(state => ({
        salesOrders: [...state.salesOrders, response],
        error: null
      }));
    } catch (error) {
      set({ error: 'Failed to add sales order' });
      throw error;
    }
  },

  updateSalesOrder: async (id, data) => {
    try {
      const response = await post(`/sales-orders/${id}`, data);
      set(state => ({
        salesOrders: state.salesOrders.map(order =>
          order.id === id ? { ...order, ...response } : order
        ),
        error: null
      }));
    } catch (error) {
      set({ error: 'Failed to update sales order' });
      throw error;
    }
  },

  fetchBOMItems: async (partId) => {
    try {
      const items = await getBOMItems(partId);
      set(state => ({
        bomItems: {
          ...state.bomItems,
          [partId]: items
        },
        error: null
      }));
    } catch (error) {
      set({ error: 'Failed to fetch BOM items' });
    }
  },

  addPart: (part) => {
    set(state => ({
      parts: [...state.parts, part],
      error: null
    }));
  },

  addCustomer: (customer) => {
    set(state => ({
      customers: [...state.customers, customer],
      error: null
    }));
  },

  addBOMItem: (parentId, item) => {
    set(state => ({
      bomItems: {
        ...state.bomItems,
        [parentId]: [...(state.bomItems[parentId] || []), item]
      },
      error: null
    }));
  },

  deletePart: (id) => {
    set(state => ({
      parts: state.parts.filter(part => part.id !== id),
      error: null
    }));
  }
}));
