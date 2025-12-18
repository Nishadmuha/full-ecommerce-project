// frontend/src/pages/CartPage.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCart, updateQuantity, removeFromCart } from '../api/cartApi';
import SuccessAlert from '../components/SuccessAlert';
import ConfirmDialog from '../components/ConfirmDialog';

const formatPrice = value => `₹${Number(value).toLocaleString('en-IN')}`;

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ isOpen: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, itemId: null });

  useEffect(() => {
    // Allow both authenticated and guest users
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      setCartItems(response.data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const product = item.productId;
      const price = product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
    const tax = 0; // 0% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cartItems]);

  // Show alert helper
  const showAlert = (message, type = 'success') => {
    setAlert({ isOpen: true, message, type });
  };

  // Increment quantity
  const incrementQuantity = async (itemId) => {
    try {
      const item = cartItems.find(i => i._id === itemId);
      if (!item) return;
      
      // Check stock availability
      if (item.availableStock !== undefined && item.quantity >= item.availableStock) {
        showAlert(`Only ${item.availableStock} items available in stock`, 'error');
        return;
      }
      
      const newQuantity = item.quantity + 1;
      const response = await updateQuantity(itemId, newQuantity);
      setCartItems(response.data.items || []);
    } catch (err) {
      console.error('Error updating quantity:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update quantity. Please try again.';
      showAlert(errorMessage, 'error');
      
      // Refresh cart to get updated stock info
      fetchCart();
    }
  };

  // Decrement quantity
  const decrementQuantity = async (itemId) => {
    try {
      const item = cartItems.find(i => i._id === itemId);
      if (!item || item.quantity <= 1) return;
      
      const newQuantity = item.quantity - 1;
      const response = await updateQuantity(itemId, newQuantity);
      setCartItems(response.data.items || []);
    } catch (err) {
      console.error('Error updating quantity:', err);
      showAlert('Failed to update quantity. Please try again.', 'error');
    }
  };

  // Open confirmation dialog for remove
  const handleRemoveClick = (itemId) => {
    setConfirmDialog({ isOpen: true, itemId });
  };

  // Remove item after confirmation
  const removeItem = async () => {
    const itemId = confirmDialog.itemId;
    if (!itemId) return;
    
    try {
      const item = cartItems.find(i => i._id === itemId);
      const productName = item?.productId?.title || 'item';
      
      const response = await removeFromCart(itemId);
      setCartItems(response.data.items || []);
      showAlert(`${productName} has been removed from your cart`, 'success');
    } catch (err) {
      console.error('Error removing item:', err);
      showAlert('Failed to remove item. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Main Heading */}
        <h1 className="mb-8 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal text-left">
          Your Shopping Cart
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Grid Layout: 2 columns on desktop */}
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {/* Left Column: Cart Items List (span-2) */}
          <div className="md:col-span-2 space-y-0">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500 mb-4">Your cart is empty. Continue exploring.</p>
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                {cartItems.map((item) => {
                  const product = item.productId;
                  const price = product?.price || 0;
                  const title = product?.title || 'Product';
                  const image = product?.image || 'https://via.placeholder.com/150';
                  
                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 p-4 sm:p-6"
                    >
                      {/* Image: Square thumbnail */}
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Details: Product Name and Unit Price */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-semibold text-charcoal mb-1">
                          {title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatPrice(price)} each
                        </p>
                      </div>

                      {/* Quantity Counter */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decrementQuantity(item._id)}
                            disabled={item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <span className="text-lg">–</span>
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementQuantity(item._id)}
                            disabled={item.availableStock !== undefined && item.quantity >= item.availableStock}
                            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <span className="text-lg">+</span>
                          </button>
                        </div>
                        {item.availableStock !== undefined && (
                          <span className={`text-xs ${
                            item.availableStock === 0 
                              ? 'text-red-600' 
                              : item.availableStock < 10 
                                ? 'text-amber-600' 
                                : 'text-green-600'
                          }`}>
                            {item.availableStock === 0 
                              ? 'Out of stock' 
                              : `${item.availableStock} available`
                            }
                          </span>
                        )}
                      </div>

                      {/* Total: Bold Red */}
                      <div className="text-right min-w-[100px]">
                        <p className="text-lg font-bold text-[#FF4D4D]">
                          {formatPrice(price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove: Trash Can Icon */}
                      <button
                        type="button"
                        onClick={() => handleRemoveClick(item._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                        aria-label="Remove item"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Order Summary (span-1) */}
          <aside className="md:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 font-display text-xl font-semibold text-charcoal">Order Summary</h2>
              
              <div className="space-y-4 text-sm">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="text-[#FF4D4D] font-semibold">{formatPrice(totals.subtotal)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-gray-500">Calculated at checkout</span>
                </div>

                {/* Taxes (0%) */}
                <div className="flex justify-between text-gray-700">
                  <span>Taxes (0%)</span>
                  <span className="text-[#FF4D4D] font-semibold">{formatPrice(totals.tax)}</span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-4" />

                {/* Total */}
                <div className="flex justify-between text-base font-bold">
                  <span className="text-charcoal">Total</span>
                  <span className="text-[#FF4D4D]">{formatPrice(totals.total)}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={() => {
                  if (cartItems.length === 0) {
                    showAlert('Your cart is empty. Add items to continue.', 'error');
                    return;
                  }
                  navigate('/checkout');
                }}
                className="mt-6 w-full rounded-lg bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Custom Alert Notification */}
      <SuccessAlert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        message={alert.message}
        type={alert.type}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, itemId: null })}
        onConfirm={removeItem}
        title="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
