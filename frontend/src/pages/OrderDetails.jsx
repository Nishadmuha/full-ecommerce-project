import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrderById } from '../api/orderApi';

const formatPrice = value => `₹${Number(value).toLocaleString('en-IN')}`;

export default function OrderDetails() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [orderId, user, navigate]);

  const fetchOrder = async () => {
    try {
      const response = await getOrderById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error.response?.status === 403) {
        navigate('/orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    packed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link
            to="/orders"
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-semibold">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-[#FF4D4D]">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item, index) => {
                const product = item.productId;
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded">
                    {product?.image && (
                      <img src={product.image} alt={product.title} className="w-20 h-20 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{product?.title || 'Product'}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: {formatPrice(item.price)} each</p>
                    </div>
                    <p className="font-semibold text-lg">{formatPrice(item.quantity * item.price)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address */}
          {order.address && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="bg-gray-50 rounded p-4">
                <p className="font-medium">{order.address.fullName || order.address.street}</p>
                {order.address.phone && <p className="text-gray-600">{order.address.phone}</p>}
                {order.address.street && <p className="text-gray-600">{order.address.street}</p>}
                <p className="text-gray-600">
                  {order.address.city}, {order.address.state} {order.address.zipCode}
                </p>
                {order.address.country && <p className="text-gray-600">{order.address.country}</p>}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-[#FF4D4D]">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}












