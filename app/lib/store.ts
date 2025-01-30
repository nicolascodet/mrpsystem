import { create } from 'zustand';
import { getCustomers, getParts, getSalesOrders } from './api';
import type { Customer, Part, SalesOrder } from '../types';

interface AppState {
  customers: Customer[];
  parts: Part[];
  salesOrders: SalesOrder[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchCustomers: () => Promise<void>;
  fetchParts: () => Promise<void>;
  fetchSalesOrders: () => Promise<void>;
  fetchAllData: () => Promise<void>;
  addCustomer: (customer: Customer) => void;
  addPart: (part: Part) => void;
  addSalesOrder: (order: SalesOrder) => void;
  updateSalesOrder: (order: SalesOrder) => void;
}

export const useStore = create<AppState>((set, get) => ({
  customers: [],
  parts: [],
  salesOrders: [],
  loading: false,
  error: null,
  initialized: false,

  fetchCustomers: async () => {
    try {
      const customers = await getCustomers();
      set({ customers });
    } catch (error) {
      set({ error: 'Failed to fetch customers' });
    }
  },

  fetchParts: async () => {
    try {
      const parts = await getParts();
      set({ parts });
    } catch (error) {
      set({ error: 'Failed to fetch parts' });
    }
  },

  fetchSalesOrders: async () => {
    try {
      const salesOrders = await getSalesOrders();
      set({ salesOrders });
    } catch (error) {
      set({ error: 'Failed to fetch sales orders' });
    }
  },

  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchCustomers(),
        get().fetchParts(),
        get().fetchSalesOrders(),
      ]);
      set({ initialized: true });
    } catch (error) {
      set({ error: 'Failed to fetch data' });
    } finally {
      set({ loading: false });
    }
  },

  addCustomer: (customer: Customer) => {
    set((state) => ({
      customers: [...state.customers, customer],
    }));
  },

  addPart: (part: Part) => {
    set((state) => ({
      parts: [...state.parts, part],
    }));
  },

  addSalesOrder: (order: SalesOrder) => {
    set((state) => ({
      salesOrders: [...state.salesOrders, order],
    }));
  },

  updateSalesOrder: (updatedOrder: SalesOrder) => {
    set((state) => ({
      salesOrders: state.salesOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      ),
    }));
  },
})); 