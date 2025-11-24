// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/HomePage.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import CartPage from './pages/CartPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import Account from './pages/Account.jsx';
import ShippingAddress from './pages/ShippingAddress.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import FAQ from './pages/FAQ.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import RefundPolicy from './pages/RefundPolicy.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Users from './pages/admin/Users.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import Products from './pages/admin/Products.jsx';
import Coupons from './pages/admin/Coupons.jsx';
import Complaints from './pages/admin/Complaints.jsx';
import Categories from './pages/admin/Categories.jsx';

export default function App() {
  return (
    <>
      <Routes>
        {/* Admin Routes - No Header/Footer */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="complaints" element={<Complaints />} />
        </Route>

        {/* Public Routes - With Header/Footer */}
        <Route
          path="/*"
          element={
            <>
              <Header />
              <main className="min-h-[70vh]">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/:productId" element={<ProductDetails />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:orderId" element={<OrderDetails />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/shipping-address" element={<ShippingAddress />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </>
  );
}
