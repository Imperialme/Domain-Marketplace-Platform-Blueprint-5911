import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAnalytics } from '../context/AnalyticsContext';
import { useDomains } from '../context/DomainContext';
import AdminLayout from '../components/AdminLayout';
import MetricCard from '../components/analytics/MetricCard';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import ConversionFunnel from '../components/analytics/ConversionFunnel';
import RealtimeWidget from '../components/analytics/RealtimeWidget';

const { 
  FiTrendingUp, 
  FiUsers, 
  FiEye, 
  FiMail, 
  FiPercent, 
  FiClock,
  FiDownload,
  FiFilter
} = FiIcons;

const Analytics = () => {
  const { pageViews, conversionData, getOverallMetrics, getDomainAnalytics } = useAnalytics();
  const { domains } = useDomains();
  const [timeRange, setTimeRange] = useState(30);
  const [selectedDomain, setSelectedDomain] = useState('all');

  const overallMetrics = getOverallMetrics();

  // Prepare chart data
  const chartData = pageViews.slice(-timeRange).map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    views: day.views,
    visitors: day.uniqueVisitors
  }));

  const conversionChartData = conversionData.slice(-timeRange).map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rate: parseFloat(day.conversionRate)
  }));

  // Domain performance data
  const domainPerformance = domains.map(domain => {
    const analytics = getDomainAnalytics(domain.id, timeRange);
    return {
      name: domain.domain_name,
      views: analytics.totalViews,
      inquiries: analytics.inquiries,
      conversionRate: parseFloat(analytics.conversionRate)
    };
  }).sort((a, b) => b.views - a.views).slice(0, 10);

  // Traffic sources (mock data)
  const trafficSources = [
    { source: 'Direct', visits: 1250 },
    { source: 'Google', visits: 980 },
    { source: 'Social Media', visits: 420 },
    { source: 'Referrals', visits: 180 },
    { source: 'Email', visits: 95 }
  ];

  // Conversion funnel data
  const funnelData = [
    { label: 'Page Views', value: overallMetrics.totalPageViews },
    { label: 'Domain Views', value: Math.floor(overallMetrics.totalPageViews * 0.6) },
    { label: 'Inquiry Form Views', value: Math.floor(overallMetrics.totalPageViews * 0.3) },
    { label: 'Inquiries Submitted', value: overallMetrics.totalInquiries },
    { label: 'Qualified Leads', value: Math.floor(overallMetrics.totalInquiries * 0.7) }
  ];

  const exportAnalytics = () => {
    const data = {
      overview: overallMetrics,
      pageViews: pageViews,
      domainPerformance: domainPerformance,
      trafficSources: trafficSources,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into your domain marketplace</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiFilter} className="h-5 w-5 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            <button
              onClick={exportAnalytics}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiDownload} className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Real-time Widget */}
        <RealtimeWidget />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Page Views"
            value={overallMetrics.totalPageViews}
            change={12.5}
            icon={FiEye}
            trend={chartData.slice(-7).map(d => d.views)}
          />
          <MetricCard
            title="Unique Visitors"
            value={overallMetrics.totalUniqueVisitors}
            change={8.3}
            icon={FiUsers}
            trend={chartData.slice(-7).map(d => d.visitors)}
          />
          <MetricCard
            title="Total Inquiries"
            value={overallMetrics.totalInquiries}
            change={15.7}
            icon={FiMail}
          />
          <MetricCard
            title="Conversion Rate"
            value={overallMetrics.conversionRate}
            change={-2.1}
            changeType="positive"
            icon={FiPercent}
            suffix="%"
          />
          <MetricCard
            title="Avg. Bounce Rate"
            value={overallMetrics.avgBounceRate}
            change={-5.2}
            changeType="negative"
            icon={FiTrendingUp}
            suffix="%"
          />
          <MetricCard
            title="Avg. Session Duration"
            value={Math.floor(overallMetrics.avgSessionDuration / 60)}
            change={18.9}
            icon={FiClock}
            suffix="m"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Traffic Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <LineChart
              data={chartData}
              xKey="date"
              yKey="views"
              title="Page Views Trend"
              color="#2563eb"
              height={250}
            />
          </div>

          {/* Conversion Rate Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <LineChart
              data={conversionChartData}
              xKey="date"
              yKey="rate"
              title="Conversion Rate Trend"
              color="#10b981"
              height={250}
            />
          </div>

          {/* Domain Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <BarChart
              data={domainPerformance.slice(0, 8)}
              xKey="name"
              yKey="views"
              title="Top Performing Domains"
              color="#8b5cf6"
              height={250}
            />
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <PieChart
              data={trafficSources}
              labelKey="source"
              valueKey="visits"
              title="Traffic Sources"
            />
          </div>
        </div>

        {/* Conversion Funnel */}
        <ConversionFunnel data={funnelData} />

        {/* Detailed Tables */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Domains Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Domain Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Domain</th>
                    <th className="text-right py-3 px-6 font-medium text-gray-900">Views</th>
                    <th className="text-right py-3 px-6 font-medium text-gray-900">Inquiries</th>
                    <th className="text-right py-3 px-6 font-medium text-gray-900">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {domainPerformance.slice(0, 6).map((domain, index) => (
                    <motion.tr
                      key={domain.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-3 px-6 text-sm text-gray-900">{domain.name}</td>
                      <td className="py-3 px-6 text-sm text-gray-900 text-right">{domain.views.toLocaleString()}</td>
                      <td className="py-3 px-6 text-sm text-gray-900 text-right">{domain.inquiries}</td>
                      <td className="py-3 px-6 text-sm text-gray-900 text-right">{domain.conversionRate}%</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Traffic Sources Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Source</th>
                    <th className="text-right py-3 px-6 font-medium text-gray-900">Visits</th>
                    <th className="text-right py-3 px-6 font-medium text-gray-900">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trafficSources.map((source, index) => {
                    const totalVisits = trafficSources.reduce((sum, s) => sum + s.visits, 0);
                    const percentage = ((source.visits / totalVisits) * 100).toFixed(1);
                    
                    return (
                      <motion.tr
                        key={source.source}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="py-3 px-6 text-sm text-gray-900">{source.source}</td>
                        <td className="py-3 px-6 text-sm text-gray-900 text-right">{source.visits.toLocaleString()}</td>
                        <td className="py-3 px-6 text-sm text-gray-900 text-right">{percentage}%</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;