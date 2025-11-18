import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import orderApi from "../api/orderApi";

export default function CheckoutPage() {
  const { cart, user, clearCart } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    houseNo: user?.houseNo || "",
    street: user?.street || "",
    landmark: user?.landmark || "",
    nearBy: user?.nearBy || "",
    city: user?.city || "",
    district: user?.district || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
  });

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!user) return navigate("/login");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const orderData = {
        items: cart,
        total,
        shippingInfo: form,
      };

      const res = await orderApi.placeOrder(orderData);

      clearCart();

      alert(`✅ Order placed successfully! Order ID: ${res.data.orderId}`);

      navigate("/user");
    } catch (error) {
      console.error('Order failed:', error);
      alert(`❌ Failed to place order: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4 lg:col-span-2"
      >
        <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="tel"
          placeholder="Phone Number *"
          className="w-full border p-2 rounded"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          pattern="[0-9]{10}"
          title="Please enter a valid 10-digit phone number"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="House/Flat No. *"
            className="w-full border p-2 rounded"
            value={form.houseNo}
            onChange={(e) => setForm({ ...form, houseNo: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Street/Area *"
            className="w-full border p-2 rounded"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Landmark *"
            className="w-full border p-2 rounded"
            value={form.landmark}
            onChange={(e) => setForm({ ...form, landmark: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Near By (e.g., Temple, School) *"
            className="w-full border p-2 rounded"
            value={form.nearBy}
            onChange={(e) => setForm({ ...form, nearBy: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="City *"
            className="w-full border p-2 rounded"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="District *"
            className="w-full border p-2 rounded"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="State *"
            className="w-full border p-2 rounded"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="PIN Code *"
            className="w-full border p-2 rounded"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            pattern="[0-9]{6}"
            title="Please enter a valid 6-digit PIN code"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 mt-6"
        >
          Place Order
        </button>
      </form>

      {/* Summary */}
      <div className="bg-white p-6 rounded shadow h-fit sticky top-20">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

        <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
