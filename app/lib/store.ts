import { create } from 'zustand';
import { getCustomers, getParts, getSalesOrders, getBOMItems, createBOMItem } from './api';
import type { Customer, Part, SalesOrder, BOMItem, ProductionRun, Machine, MaintenanceRecord, QualityCheck, PurchaseOrder } from '../types';

interface AppState {
  // Data
  customers: Customer[];
  parts: Part[];
  salesOrders: SalesOrder[];
  bomItems: { [key: number]: BOMItem[] };
  productionRuns: ProductionRun[];
  machines: Machine[];
  maintenanceRecords: MaintenanceRecord[];
  qualityChecks: QualityCheck[];
  purchaseOrders: PurchaseOrder[];
  
  // UI State
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Fetch Actions
  fetchCustomers: () => Promise<void>;
  fetchParts: () => Promise<void>;
  fetchSalesOrders: () => Promise<void>;
  fetchBOMItems: (partId: number) => Promise<void>;
  fetchAllData: () => Promise<void>;

  // Add Actions
  addCustomer: (customer: Customer) => void;
  addPart: (part: Part) => void;
  addSalesOrder: (order: SalesOrder) => void;
  addBOMItem: (partId: number, bomItem: BOMItem) => void;
  addProductionRun: (run: ProductionRun) => void;
  addMachine: (machine: Machine) => void;
  addMaintenanceRecord: (record: MaintenanceRecord) => void;
  addQualityCheck: (check: QualityCheck) => void;
  addPurchaseOrder: (order: PurchaseOrder) => void;

  // Update Actions
  updateSalesOrder: (order: SalesOrder) => void;
  updatePart: (part: Part) => void;
  updateProductionRun: (run: ProductionRun) => void;
  updateMachine: (machine: Machine) => void;
  updateMaintenanceRecord: (record: MaintenanceRecord) => void;
  updateQualityCheck: (check: QualityCheck) => void;
  updatePurchaseOrder: (order: PurchaseOrder) => void;

  // Delete Actions
  deletePart: (partId: number) => void;
  deleteBOMItem: (partId: number, bomItemId: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  customers: [],
  parts: [],
  salesOrders: [],
  bomItems: {},
  productionRuns: [],
  machines: [],
  maintenanceRecords: [],
  qualityChecks: [],
  purchaseOrders: [],
  loading: false,
  error: null,
  initialized: false,

  // Fetch Actions
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

  fetchBOMItems: async (partId: number) => {
    try {
      const items = await getBOMItems(partId);
      set((state) => ({
        bomItems: {
          ...state.bomItems,
          [partId]: items
        }
      }));
    } catch (error) {
      set({ error: 'Failed to fetch BOM items' });
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

  // Add Actions
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

  addBOMItem: (partId: number, bomItem: BOMItem) => {
    set((state) => ({
      bomItems: {
        ...state.bomItems,
        [partId]: [...(state.bomItems[partId] || []), bomItem]
      }
    }));
  },

  addProductionRun: (run: ProductionRun) => {
    set((state) => ({
      productionRuns: [...state.productionRuns, run],
    }));
  },

  addMachine: (machine: Machine) => {
    set((state) => ({
      machines: [...state.machines, machine],
    }));
  },

  addMaintenanceRecord: (record: MaintenanceRecord) => {
    set((state) => ({
      maintenanceRecords: [...state.maintenanceRecords, record],
    }));
  },

  addQualityCheck: (check: QualityCheck) => {
    set((state) => ({
      qualityChecks: [...state.qualityChecks, check],
    }));
  },

  addPurchaseOrder: (order: PurchaseOrder) => {
    set((state) => ({
      purchaseOrders: [...state.purchaseOrders, order],
    }));
  },

  // Update Actions
  updateSalesOrder: (updatedOrder: SalesOrder) => {
    set((state) => ({
      salesOrders: state.salesOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      ),
    }));
  },

  updatePart: (updatedPart: Part) => {
    set((state) => ({
      parts: state.parts.map((part) =>
        part.id === updatedPart.id ? updatedPart : part
      ),
    }));
  },

  updateProductionRun: (updatedRun: ProductionRun) => {
    set((state) => ({
      productionRuns: state.productionRuns.map((run) =>
        run.id === updatedRun.id ? updatedRun : run
      ),
    }));
  },

  updateMachine: (updatedMachine: Machine) => {
    set((state) => ({
      machines: state.machines.map((machine) =>
        machine.id === updatedMachine.id ? updatedMachine : machine
      ),
    }));
  },

  updateMaintenanceRecord: (updatedRecord: MaintenanceRecord) => {
    set((state) => ({
      maintenanceRecords: state.maintenanceRecords.map((record) =>
        record.id === updatedRecord.id ? updatedRecord : record
      ),
    }));
  },

  updateQualityCheck: (updatedCheck: QualityCheck) => {
    set((state) => ({
      qualityChecks: state.qualityChecks.map((check) =>
        check.id === updatedCheck.id ? updatedCheck : check
      ),
    }));
  },

  updatePurchaseOrder: (updatedOrder: PurchaseOrder) => {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      ),
    }));
  },

  // Delete Actions
  deletePart: (partId: number) => {
    set((state) => {
      const newBomItems = { ...state.bomItems };
      delete newBomItems[partId];
      return {
        parts: state.parts.filter((part) => part.id !== partId),
        bomItems: newBomItems
      };
    });
  },

  deleteBOMItem: (partId: number, bomItemId: number) => {
    set((state) => ({
      bomItems: {
        ...state.bomItems,
        [partId]: (state.bomItems[partId] || []).filter((item) => item.id !== bomItemId)
      }
    }));
  },
})); 