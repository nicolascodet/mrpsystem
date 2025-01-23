'use client';

import { useEffect, useState } from 'react';
import { getParts, getProductionRuns, getQualityChecks } from '@/lib/api';
import { Card, Title, AreaChart, DonutChart } from '@tremor/react';

export default function Home() {
  const [parts, setParts] = useState<any[]>([]);
  const [productionRuns, setProductionRuns] = useState<any[]>([]);
  const [qualityChecks, setQualityChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    async function loadData() {
      try {
        const [partsData, productionData, qualityData] = await Promise.all([
          getParts(),
          getProductionRuns(),
          getQualityChecks()
        ]);
        setParts(partsData);
        setProductionRuns(productionData);
        setQualityChecks(qualityData);
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

  // Calculate revenue from completed production runs
  const calculateRevenue = () => {
    const completedRuns = productionRuns.filter(run => run.status === "completed");
    return completedRuns.reduce((total, run) => {
      const part = parts.find(p => p.id === run.part_id);
      return total + (part ? part.price * run.quantity : 0);
    }, 0);
  };

  // Prepare data for revenue chart
  const revenueData = productionRuns
    .filter(run => run.status === "completed")
    .map(run => {
      const part = parts.find(p => p.id === run.part_id);
      const revenue = part ? part.price * run.quantity : 0;
      return {
        date: new Date(run.start_time).toLocaleDateString(),
        Revenue: revenue
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prepare data for quality chart
  const qualityData = [
    {
      name: 'Passed',
      value: qualityChecks.filter(check => check.status === 'passed').length
    },
    {
      name: 'Failed',
      value: qualityChecks.filter(check => check.status === 'failed').length
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-indigo-600 font-medium">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          MRP Dashboard
        </h1>
        <p className="text-sm text-indigo-600">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg rounded-xl p-6 border border-indigo-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-indigo-900">Total Parts</h2>
            <span className="text-2xl font-bold text-purple-600">{parts.length}</span>
          </div>
          <p className="mt-2 text-sm text-indigo-600">Parts in inventory</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg rounded-xl p-6 border border-purple-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-purple-900">Active Production</h2>
            <span className="text-2xl font-bold text-pink-600">
              {productionRuns.filter(run => run.status === 'in_progress').length}
            </span>
          </div>
          <p className="mt-2 text-sm text-purple-600">Running production lines</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg rounded-xl p-6 border border-pink-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-pink-900">Total Revenue</h2>
            <span className="text-2xl font-bold text-rose-600">
              ${calculateRevenue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="mt-2 text-sm text-pink-600">From completed orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white to-indigo-50 border-indigo-100">
          <Title className="text-indigo-900 mb-4">Revenue Over Time</Title>
          <AreaChart
            className="h-72 mt-4"
            data={revenueData}
            index="date"
            categories={["Revenue"]}
            colors={["indigo"]}
            valueFormatter={(number) => `$${number.toLocaleString()}`}
          />
        </Card>

        <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-100">
          <Title className="text-purple-900 mb-4">Quality Check Results</Title>
          <DonutChart
            className="h-72 mt-4"
            data={qualityData}
            category="value"
            index="name"
            colors={["emerald", "rose"]}
            valueFormatter={(number) => number.toString()}
          />
        </Card>

        <Card className="bg-gradient-to-br from-white to-pink-50 border-pink-100">
          <Title className="text-pink-900 mb-4">Recent Parts</Title>
          <div className="overflow-hidden">
            {parts.length > 0 ? (
              <table className="min-w-full divide-y divide-pink-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-pink-600 uppercase">Part Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-pink-600 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-pink-600 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {parts.slice(0, 5).map((part) => (
                    <tr key={part.id} className="hover:bg-pink-50/50">
                      <td className="px-4 py-3 text-sm text-pink-900">{part.part_number}</td>
                      <td className="px-4 py-3 text-sm text-pink-600">{part.description}</td>
                      <td className="px-4 py-3 text-sm text-pink-900 text-right">${part.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-sm text-pink-600 py-4">No parts available</p>
            )}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-white to-rose-50 border-rose-100">
          <Title className="text-rose-900 mb-4">Production Status</Title>
          <div className="overflow-hidden">
            {productionRuns.length > 0 ? (
              <table className="min-w-full divide-y divide-rose-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-rose-600 uppercase">Run ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-rose-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-rose-600 uppercase">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {productionRuns.slice(0, 5).map((run) => (
                    <tr key={run.id} className="hover:bg-rose-50/50">
                      <td className="px-4 py-3 text-sm text-rose-900">#{run.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          run.status === 'completed' ? 'bg-green-100 text-green-800' :
                          run.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-rose-900 text-right">{run.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-sm text-rose-600 py-4">No production runs available</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
