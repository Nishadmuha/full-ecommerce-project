import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../../api/adminApi';

export default function Orders() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    
    const loadOrders = async () => {
      try {
        const response = await getAllOrders();
        let ordersData = response.data;
        
        // Filter by status if provided
        if (status) {
          ordersData = ordersData.filter(o => o.status === status);
        }
        
        setOrders(ordersData);
        
        // Select order if orderId is provided
        if (orderId) {
          const order = response.data.find(o => o._id === orderId);
          if (order) {
            setSelectedOrder(order);
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      const response = await getAllOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      alert('Error updating order status');
    }
  };

  const statusOptions = ['pending', 'packed', 'shipped', 'delivered', 'cancelled'];
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    packed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-900"
                    >
                      {order._id.slice(-8)}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.userId?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{order.userId?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Order ID:</h3>
                <p className="text-gray-600">{selectedOrder._id}</p>
              </div>
              <div>
                <h3 className="font-semibold">Customer:</h3>
                <p className="text-gray-600">{selectedOrder.userId?.name} ({selectedOrder.userId?.email})</p>
                {selectedOrder.userId?.phone && <p className="text-gray-600">Phone: {selectedOrder.userId.phone}</p>}
              </div>
              <div>
                <h3 className="font-semibold">Items:</h3>
                <div className="space-y-2 mt-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                      {item.productId?.image && (
                        <img src={item.productId.image} alt={item.productId.title} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.productId?.title || 'Product'}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold">${(item.quantity * item.price)?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Total Amount:</h3>
                <p className="text-2xl font-bold text-gray-900">${selectedOrder.totalAmount?.toFixed(2)}</p>
              </div>
              {selectedOrder.address && (
                <div>
                  <h3 className="font-semibold">Shipping Address:</h3>
                  <p className="text-gray-600">{JSON.stringify(selectedOrder.address, null, 2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



