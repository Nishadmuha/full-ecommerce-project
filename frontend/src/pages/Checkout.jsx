import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCart } from '../api/cartApi';
import { createOrder } from '../api/orderApi';
import { createRazorpayOrder, verifyPayment } from '../api/paymentApi';
import SuccessAlert from '../components/SuccessAlert';

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
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [showAlert, setShowAlert] = useState(false);
  
  // Address form state
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  // Payment form state
  const [payment, setPayment] = useState({
    paymentMethod: 'razorpay' // Default to Razorpay
  });

  useEffect(() => {
    fetchCart();
  }, []);

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
    const requiredFields = !user 
      ? ['fullName', 'email', 'phone', 'street', 'city', 'state', 'zipCode']
      : ['fullName', 'phone', 'street', 'city', 'state', 'zipCode'];
    
    const missingFields = requiredFields.filter(field => !address[field]);
    
    if (missingFields.length > 0) {
      setAlertMessage('Please fill in all required fields');
      setAlertType('error');
      setShowAlert(true);
      return;
    }
    setStep(2); // Move to payment step
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    setProcessing(true);
    try {
      if (payment.paymentMethod === 'razorpay') {
        // Create Razorpay order
        const response = await createRazorpayOrder(address);
        const { orderId, razorpayOrderId, amount, currency, key } = response.data;

        // Load Razorpay script
        const razorpayLoaded = await loadRazorpayScript();
        if (!razorpayLoaded) {
          setAlertMessage('Razorpay SDK failed to load. Please refresh the page.');
          setAlertType('error');
          setShowAlert(true);
          setProcessing(false);
          return;
        }

        // Initialize Razorpay checkout
        const options = {
          key: key,
          amount: amount,
          currency: currency,
          name: '6XO BAGS',
          description: 'Order Payment',
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              // Verify payment on backend
              const verifyResponse = await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: orderId
              });

              if (verifyResponse.data.success) {
                setOrder(verifyResponse.data.order);
                setStep(3); // Move to confirmation step
                setAlertMessage('Payment successful! Order confirmed.');
                setAlertType('success');
                setShowAlert(true);
              } else {
                setAlertMessage('Payment verification failed. Please contact support.');
                setAlertType('error');
                setShowAlert(true);
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              setAlertMessage(error.response?.data?.message || 'Payment verification failed. Please contact support.');
              setAlertType('error');
              setShowAlert(true);
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: address.fullName,
            email: address.email || user?.email || '',
            contact: address.phone || ''
          },
          theme: {
            color: '#000000'
          },
          modal: {
            ondismiss: function() {
              setProcessing(false);
              setAlertMessage('Payment cancelled');
              setAlertType('error');
              setShowAlert(true);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else if (payment.paymentMethod === 'cod') {
        // Cash on Delivery - create order directly
        const orderData = await createOrder(address, 'cod');
        setOrder(orderData.data);
        setStep(3); // Move to confirmation step
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setAlertMessage(error.response?.data?.message || 'Failed to process payment. Please try again.');
      setAlertType('error');
      setShowAlert(true);
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
                  {!user && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={address.email}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  )}
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
                      <option value="razorpay">Razorpay (Credit/Debit Card, UPI, Net Banking)</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>
                  
                  {payment.paymentMethod === 'razorpay' && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Secure Payment via Razorpay</strong>
                      </p>
                      <p className="text-xs text-blue-700">
                        You will be redirected to Razorpay's secure payment gateway. We support Credit/Debit Cards, UPI, Net Banking, and Wallets.
                      </p>
                    </div>
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

      {/* Success/Error Alert */}
      <SuccessAlert
        message={alertMessage}
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertType}
      />
    </div>
  );
}

