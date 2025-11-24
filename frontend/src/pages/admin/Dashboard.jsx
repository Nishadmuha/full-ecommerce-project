import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../api/adminApi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.stats?.totalUsers || 0, 
      icon: '👥', 
      color: 'blue',
      path: '/admin/users',
      hoverColor: 'hover:bg-blue-50 hover:border-blue-300'
    },
    { 
      label: 'Total Orders', 
      value: stats?.stats?.totalOrders || 0, 
      icon: '📦', 
      color: 'green',
      path: '/admin/orders',
      hoverColor: 'hover:bg-green-50 hover:border-green-300'
    },
    { 
      label: 'Total Products', 
      value: stats?.stats?.totalProducts || 0, 
      icon: '🛍️', 
      color: 'purple',
      path: '/admin/products',
      hoverColor: 'hover:bg-purple-50 hover:border-purple-300'
    },
    { 
      label: 'Total Revenue', 
      value: `$${stats?.stats?.totalRevenue?.toFixed(2) || '0.00'}`, 
      icon: '💰', 
      color: 'yellow',
      path: '/admin/orders',
      hoverColor: 'hover:bg-yellow-50 hover:border-yellow-300'
    },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    packed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <button
            key={index}
            onClick={() => navigate(stat.path)}
            className="bg-white rounded-lg shadow p-6 border-2 border-transparent transition-all duration-200 cursor-pointer text-left w-full hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
            <div className="mt-4 text-xs text-gray-500 flex items-center">
              <span>View Details</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Orders by Status</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {stats?.ordersByStatus?.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(`/admin/orders?status=${item._id}`)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item._id] || 'bg-gray-100 text-gray-800'}`}>
                  {item._id}
                </span>
                <span className="text-lg font-semibold">{item.count}</span>
              </button>
            ))}
            {(!stats?.ordersByStatus || stats.ordersByStatus.length === 0) && (
              <div className="text-center py-4 text-gray-500 text-sm">No orders found</div>
            )}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          <div className="space-y-3">
            {stats?.monthlyRevenue?.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <span className="text-gray-600">{item._id}</span>
                <div className="text-right">
                  <p className="font-semibold">${item.revenue?.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{item.orders} orders</p>
                </div>
              </div>
            ))}
            {(!stats?.monthlyRevenue || stats.monthlyRevenue.length === 0) && (
              <div className="text-center py-4 text-gray-500 text-sm">No revenue data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            View All Orders
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentOrders?.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => navigate(`/admin/orders?orderId=${order._id}`)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.userId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.totalAmount?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No recent orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



