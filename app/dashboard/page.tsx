'use client';

import { useEffect, useState } from 'react';
import { Card, Title, AreaChart, DonutChart } from '@tremor/react';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    async function loadData() {
      try {
        // Load your data here
        setLastUpdated(new Date());
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-blue-600 font-medium">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Unit MRP Dashboard
        </h1>
        <p className="text-sm text-blue-600">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg rounded-xl p-6 border border-blue-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-blue-900">Active Orders</h2>
            <span className="text-2xl font-bold text-indigo-600">0</span>
          </div>
          <p className="mt-2 text-sm text-blue-600">Current orders in progress</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg rounded-xl p-6 border border-indigo-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-indigo-900">Machines</h2>
            <span className="text-2xl font-bold text-purple-600">0</span>
          </div>
          <p className="mt-2 text-sm text-indigo-600">Total machines</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg rounded-xl p-6 border border-purple-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-purple-900">Completed Orders</h2>
            <span className="text-2xl font-bold text-pink-600">0</span>
          </div>
          <p className="mt-2 text-sm text-purple-600">Orders completed this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100">
          <Title className="text-blue-900 mb-4">Order Status</Title>
          <div className="h-72 mt-4 flex items-center justify-center text-gray-500">
            No order data available
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-100">
          <Title className="text-indigo-900 mb-4">Machine Utilization</Title>
          <div className="h-72 mt-4 flex items-center justify-center text-gray-500">
            No machine data available
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-100">
          <Title className="text-purple-900 mb-4">Recent Activity</Title>
          <div className="overflow-hidden">
            <div className="flex items-center justify-center h-32 text-gray-500">
              No recent activity
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
