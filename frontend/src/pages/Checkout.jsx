import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCart } from '../api/cartApi';
import { createOrder } from '../api/orderApi';

const formatPrice = value => `₹${Number(value).toLocaleString('en-IN')}`;

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);
  
  // Address form state
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  // Payment form state
  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'card'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user, navigate]);

  const fetchCart = async () => {
    try {
      const response = await getCart();
      const items = response.data.items || [];
      if (items.length === 0) {
        navigate('/cart');
        return;
      }
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const product = item.productId;
      const price = product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
    const tax = 0;
    const shipping = 0;
    const total = subtotal + tax + shipping;
    return { subtotal, tax, shipping, total };
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    // Validate address
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.zipCode) {
      alert('Please fill in all required fields');
      return;
    }
    setStep(2); // Move to payment step
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Validate payment
    if (payment.paymentMethod === 'card') {
      if (!payment.cardNumber || !payment.cardName || !payment.expiryDate || !payment.cvv) {
        alert('Please fill in all payment details');
        return;
      }
    }

    setProcessing(true);
    try {
      // Create order
      const orderData = await createOrder(address);
      setOrder(orderData.data);
      setStep(3); // Move to confirmation step
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className={`ml-2 ${step >= 1 ? 'text-black font-semibold' : 'text-gray-500'}`}>Address</span>
            </div>
            <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className={`ml-2 ${step >= 2 ? 'text-black font-semibold' : 'text-gray-500'}`}>Payment</span>
            </div>
            <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className={`ml-2 ${step >= 3 ? 'text-black font-semibold' : 'text-gray-500'}`}>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={address.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={address.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={address.country}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={payment.paymentMethod}
                      onChange={handlePaymentChange}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>
                  
                  {payment.paymentMethod === 'card' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={payment.cardNumber}
                          onChange={handlePaymentChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          required
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={payment.cardName}
                          onChange={handlePaymentChange}
                          required
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={payment.expiryDate}
                            onChange={handlePaymentChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            required
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                          <input
                            type="text"
                            name="cvv"
                            value={payment.cvv}
                            onChange={handlePaymentChange}
                            placeholder="123"
                            maxLength="3"
                            required
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {payment.paymentMethod === 'cod' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <p className="text-sm text-yellow-800">
                        You will pay cash when the order is delivered.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && order && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                  <p className="text-gray-600">Thank you for your purchase</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="text-lg font-semibold">{order._id}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-[#FF4D4D]">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-semibold capitalize">{order.status}</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate('/orders')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => navigate('/products')}
                    className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step < 3 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => {
                    const product = item.productId;
                    const price = product?.price || 0;
                    return (
                      <div key={item._id} className="flex items-center gap-3">
                        {product?.image && (
                          <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{product?.title}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">{formatPrice(price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(totals.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(totals.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-[#FF4D4D]">{formatPrice(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

