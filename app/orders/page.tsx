'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { get, post, getCustomers, getParts, getSalesOrders } from '@/app/lib/api';

interface SalesOrder {
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

interface Part {
  id: number;
  part_number: string;
  description: string;
  price: number;
}

interface Customer {
  id: number;
  name: string;
  address: string;
  contact_person: string;
  email: string;
  phone: string;
}

interface CustomerFormData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
}

interface MaterialCheckResult {
  has_sufficient_materials: boolean;
  missing_materials?: Array<{
    material_name: string;
    missing_quantity: number;
    lead_time_days?: number;
  }>;
}

export default function OrdersPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });
  const [showMaterialAlert, setShowMaterialAlert] = useState(false);
  const [missingMaterials, setMissingMaterials] = useState<Array<{ material_name: string; missing_quantity: number; lead_time_days?: number }> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersData, partsData, customersData] = await Promise.all([
        getSalesOrders(),
        getParts(),
        getCustomers()
      ]);

      setSalesOrders(ordersData);
      setParts(partsData);
      setCustomers(customersData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      draft: 'bg-gray-500',
      confirmed: 'bg-green-500',
      in_production: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-700',
      cancelled: 'bg-red-500'
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-500';
  };

  const handleShowAddModal = async () => {
    await loadData(); // Refresh all data including parts
    setIsAddModalOpen(true);
  };

  async function handleAddOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const lineItems = [];
      const itemCount = parseInt(formData.get('itemCount') as string);
      
      for (let i = 0; i < itemCount; i++) {
        const partId = formData.get(`partId_${i}`);
        const quantity = formData.get(`quantity_${i}`);
        const unitPrice = formData.get(`unitPrice_${i}`);
        
        if (partId && quantity && unitPrice) {
          lineItems.push({
            part_id: parseInt(partId as string),
            quantity: parseInt(quantity as string),
            unit_price: parseFloat(unitPrice as string),
            delivered_quantity: 0,
            total_amount: parseInt(quantity as string) * parseFloat(unitPrice as string)
          });
        }
      }

      const orderData = {
        customer_id: parseInt(formData.get('customerId') as string),
        due_date: new Date(formData.get('dueDate') as string).toISOString(),
        status: 'draft',
        payment_terms: formData.get('paymentTerms') as string,
        shipping_address: formData.get('shippingAddress') as string,
        notes: formData.get('notes') as string,
        line_items: lineItems
      };

      await post<SalesOrder>('/sales-orders/', orderData);
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-indigo-600 font-medium">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Open Orders
        </h1>
        <button
          onClick={handleShowAddModal}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          Create Order
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sales Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesOrders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>
                    <div>{order.customer.name}</div>
                  </TableCell>
                  <TableCell>{new Date(order.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.line_items.length} items</TableCell>
                  <TableCell className="text-right">
                    ${order.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsViewModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      View Details
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Create Sales Order</h2>
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Customer</label>
                  <div className="flex gap-2">
                    <select
                      name="customerId"
                      required
                      className="flex-1 border border-indigo-200 rounded px-3 py-2"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddCustomerModalOpen(true)}
                      className="flex items-center justify-center w-10 h-10 rounded bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    className="w-full border border-indigo-200 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Payment Terms</label>
                  <select
                    name="paymentTerms"
                    required
                    className="w-full border border-indigo-200 rounded px-3 py-2"
                  >
                    <option value="net30">Net 30</option>
                    <option value="net60">Net 60</option>
                    <option value="net90">Net 90</option>
                    <option value="immediate">Immediate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Shipping Address</label>
                <textarea
                  name="shippingAddress"
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Notes</label>
                <textarea
                  name="notes"
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="border-t border-indigo-100 pt-4">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4">Line Items</h3>
                <div className="space-y-4" id="lineItems">
                  {/* Dynamic line items will be added here */}
                </div>
                <button
                  type="button"
                  className="mt-2 text-indigo-600 hover:text-indigo-800"
                  onClick={async () => {
                    await getParts().then(setParts); // Refresh parts list
                    const container = document.getElementById('lineItems');
                    const itemCount = container?.children.length || 0;
                    const newItem = document.createElement('div');
                    newItem.className = 'grid grid-cols-4 gap-4';
                    newItem.innerHTML = `
                      <input type="hidden" name="itemCount" value="${itemCount + 1}" />
                      <div>
                        <select name="partId_${itemCount}" required class="w-full border border-indigo-200 rounded px-3 py-2">
                          <option value="">Select Part</option>
                          ${parts.map(part => `
                            <option value="${part.id}">${part.part_number} - ${part.description}</option>
                          `).join('')}
                        </select>
                      </div>
                      <div>
                        <input type="number" name="quantity_${itemCount}" required placeholder="Quantity" class="w-full border border-indigo-200 rounded px-3 py-2" min="1" />
                      </div>
                      <div>
                        <input type="number" name="unitPrice_${itemCount}" required placeholder="Unit Price" class="w-full border border-indigo-200 rounded px-3 py-2" min="0" step="0.01" />
                      </div>
                      <div>
                        <button type="button" class="text-red-600 hover:text-red-800" onclick="this.parentElement.parentElement.remove()">Remove</button>
                      </div>
                    `;
                    container?.appendChild(newItem);
                  }}
                >
                  + Add Line Item
                </button>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:from-indigo-700 hover:to-purple-700"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-indigo-900">Order Details</h2>
                <p className="text-indigo-600">{selectedOrder.order_number}</p>
              </div>
              <Badge className={getStatusColor(selectedOrder.status)}>
                {selectedOrder.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-indigo-900">Customer Information</h3>
                <p className="mt-1">{selectedOrder.customer.name}</p>
                <p className="mt-1 text-sm text-gray-600">{selectedOrder.shipping_address}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-indigo-900">Order Information</h3>
                <p className="mt-1">Due Date: {new Date(selectedOrder.due_date).toLocaleDateString()}</p>
                <p className="mt-1">Payment Terms: {selectedOrder.payment_terms}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">Line Items</h3>
              <table className="min-w-full divide-y divide-indigo-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Part</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Delivered</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-indigo-600 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {selectedOrder.line_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm text-indigo-900">{item.part.part_number}</div>
                        <div className="text-sm text-indigo-600">{item.part.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-indigo-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-indigo-900">${item.unit_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-indigo-900">{item.delivered_quantity}</td>
                      <td className="px-6 py-4 text-sm text-indigo-900 text-right">${item.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-50">
                    <td colSpan={4} className="px-6 py-4 text-sm font-medium text-indigo-900">Total</td>
                    <td className="px-6 py-4 text-sm font-medium text-indigo-900 text-right">
                      ${selectedOrder.total_amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {selectedOrder.notes && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-indigo-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
              >
                Close
              </button>
              {selectedOrder.status === 'draft' && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/sales-orders/${selectedOrder.id}/check-materials`, {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/json',
                        }
                      });

                      if (!response.ok) {
                        throw new Error('Failed to check materials');
                      }

                      const result = await response.json();
                      if (result.has_sufficient_materials) {
                        // Update order status to in_production
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/sales-orders/${selectedOrder.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            ...selectedOrder,
                            status: 'in_production'
                          }),
                        });
                        setIsViewModalOpen(false);
                        loadData();
                      } else {
                        // Show material shortage notification
                        setMissingMaterials(result.missing_materials || null);
                        setShowMaterialAlert(true);
                      }
                    } catch (error) {
                      console.error('Error checking materials:', error);
                      setError('Failed to check materials');
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Start Production
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Material Shortage Alert Modal */}
      {showMaterialAlert && missingMaterials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">Insufficient Materials</h3>
            <div className="space-y-3 mb-4">
              <p className="text-gray-700">The following materials are missing:</p>
              {missingMaterials.map((item, index) => (
                <div key={index} className="bg-red-50 p-3 rounded">
                  <p className="text-sm font-medium text-gray-900">{item.material_name}</p>
                  <p className="text-sm text-gray-600">
                    Missing Quantity: {item.missing_quantity}
                    {item.lead_time_days && (
                      <span className="ml-2">
                        (Est. Lead Time: {item.lead_time_days} days)
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMaterialAlert(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Navigate to purchase orders with missing materials
                  window.location.href = `/purchasing?missing_materials=${encodeURIComponent(JSON.stringify(missingMaterials))}`;
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Create Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Add New Customer</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await post('/customers/', customerFormData);

                // Refresh customers list
                loadData();
                setIsAddCustomerModalOpen(false);
                // Reset form
                setCustomerFormData({
                  name: '',
                  contact_person: '',
                  email: '',
                  phone: '',
                  address: ''
                });
              } catch (error) {
                console.error('Error creating customer:', error);
                setError('Failed to create customer');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Company Name</label>
                <input
                  type="text"
                  value={customerFormData.name}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={customerFormData.contact_person}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                  required
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerFormData.email}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full border border-indigo-200 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={customerFormData.phone}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="w-full border border-indigo-200 rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-1">Address</label>
                <textarea
                  value={customerFormData.address}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                  rows={3}
                  className="w-full border border-indigo-200 rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded hover:from-indigo-700 hover:to-purple-700"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 