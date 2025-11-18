import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AppProvider } from "./context/AppContext";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import WhatsAppFloatingButton from "./components/common/WhatsAppFloatingButton";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import UserPanel from "./pages/UserPanel/UserPanel";
import AdminPanel from "./pages/AdminPanel/AdminPanel";

export default function App() {
  return (
    <AppProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Header />

        <main className="min-h-screen container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user" element={<UserPanel />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>

        <WhatsAppFloatingButton />
        <Footer />
      </Router>
    </AppProvider>
  );
}
