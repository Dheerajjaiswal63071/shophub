import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import adminApi from "../../api/adminApi";

export default function AdminPanel() {
  const { user, products: ctxProducts, addProduct: ctxAddProduct, updateProduct: ctxUpdateProduct, deleteProduct: ctxDeleteProduct } = useApp();

  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
  });

  const [editing, setEditing] = useState(null); // product to edit
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchOrderId, setSearchOrderId] = useState("");

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Fetch all data from backend (products, orders, users)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetch('http://localhost:5000/api/products').then(r => r.json()),
          adminApi.orders(),
          adminApi.users()
        ]);
        setProducts(productsRes);
        // Sort orders by date (newest first)
        const sortedOrders = (ordersRes.data?.orders || ordersRes.data || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        setUsers(usersRes.data?.users || usersRes.data || []);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      }
    };
    
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  // Upload image to Cloudinary
  const uploadImage = async () => {
    if (!selectedFile) {
      alert("Please select an image first!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/uploads/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let msg = "Upload failed";
        try { const err = await response.json(); if (err?.message) msg = err.message; } catch {}
        throw new Error(msg);
      }

      const data = await response.json();
      setForm({ ...form, image: data.url });
      setSelectedFile(null);
      alert("✅ Image uploaded successfully!");
    } catch (error) {
      alert("❌ Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Protect admin
  if (!user || user.role !== "admin")
    return (
      <div className="py-20 text-center text-xl">
        Access denied — Admin only.
      </div>
    );

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCustomers = users.filter((u) => u.role === "customer").length;

  // Submit Product Add/Edit
  const saveProduct = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.stock || !form.category || !form.image || !form.description) {
      alert("All fields are required!");
      return;
    }

    const data = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editing) {
        await ctxUpdateProduct(editing._id, data);
        alert("✅ Product updated successfully!");
      } else {
        await ctxAddProduct(data);
        alert("✅ Product added successfully!");
      }

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        stock: "",
      });

      setEditing(null);
      await fetchProducts();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await ctxDeleteProduct(id);
      await fetchProducts();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // Update Order Status
  const updateOrderStatus = async (id, status) => {
    try {
      await adminApi.updateOrder(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      alert("✅ Order status updated!");
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("❌ Failed to update order status");
    }
  };

  // Delete Order
  const deleteOrder = async (id) => {
    if (!confirm("⚠️ Are you sure you want to delete this order? This action cannot be undone.")) return;
    try {
      await adminApi.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o._id !== id));
      alert("✅ Order deleted successfully!");
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("❌ Failed to delete order");
    }
  };

  // Delete User
  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await adminApi.deleteUser(id);
      // Refresh users list from backend
      const usersRes = await adminApi.users();
      setUsers(usersRes.data?.users || usersRes.data || []);
      alert("✅ User deleted successfully!");
    } catch (error) {
      console.error("Delete user error:", error);
      alert("❌ Failed to delete user: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🔧 Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-2 rounded-lg mb-6">
        {["dashboard", "products", "orders", "users"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md ${
              tab === t
                ? "bg-white shadow font-semibold text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-600 text-white p-6 rounded-lg">
              <h2>Total Products</h2>
              <p className="text-4xl font-bold">{products.length}</p>
            </div>

            <div className="bg-green-600 text-white p-6 rounded-lg">
              <h2>Total Orders</h2>
              <p className="text-4xl font-bold">{orders.length}</p>
            </div>

            <div className="bg-purple-600 text-white p-6 rounded-lg">
              <h2>Total Revenue</h2>
              <p className="text-4xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>

            <div className="bg-orange-600 text-white p-6 rounded-lg">
              <h2>Customers</h2>
              <p className="text-4xl font-bold">{totalCustomers}</p>
            </div>
          </div>

          {/* Recent Orders - Hidden, use ORDERS tab instead */}

          {/* Low Stock */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Low Stock Items</h2>

            {products.filter((p) => p.stock < 20).length === 0 ? (
              <p className="text-gray-500">No low stock products</p>
            ) : (
              products
                .filter((p) => p.stock < 20)
                .map((p) => (
                  <div key={p._id} className="border-b py-3">
                    <div className="flex justify-between">
                      <p>{p.name}</p>
                      <p className="text-red-600 font-bold">{p.stock} left</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Products */}
      {tab === "products" && (
        <div className="space-y-6">
          {/* Add/Edit Form */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg border-2 border-blue-200">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              {editing ? "✏️ Edit Product" : "➕ Add New Product"}
            </h2>

            <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Premium Laptop"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <input
                  type="text"
                  placeholder="e.g., Electronics"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image *</label>
                
                {/* File Upload Section */}
                <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg mb-3">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Upload image from your device</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition inline-block"
                      >
                        📁 Choose Image
                      </label>
                    </div>
                    
                    {selectedFile && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-700">📎 {selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={uploadImage}
                          disabled={uploading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                          {uploading ? "⏳ Uploading..." : "☁️ Upload to Cloudinary"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* OR Manual URL */}
                <div className="text-center text-gray-500 text-sm mb-2">OR paste image URL</div>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
                
                {form.image && (
                  <div className="mt-4 flex justify-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img src={form.image} alt="Preview" className="h-32 rounded-lg object-cover border-2 border-gray-300" />
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  placeholder="Enter detailed product description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  rows="4"
                />
              </div>

              <div className="md:col-span-2 flex gap-3 justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition transform hover:scale-105"
                >
                  {editing ? "🔄 Update Product" : "✅ Add Product"}
                </button>

                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setForm({
                        name: "",
                        description: "",
                        price: "",
                        category: "",
                        image: "",
                        stock: "",
                      });
                    }}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition"
                  >
                    ❌ Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products List */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">📦 Product Inventory ({products.length})</h2>
            
            {products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No products yet. Add your first product above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {products.map((p) => (
                  <div key={p._id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300" />
                      </div>

                      {/* Details */}
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-gray-800">{p.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{p.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <span className="text-xs text-gray-500">Category</span>
                            <p className="font-semibold">{p.category}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Price</span>
                            <p className="font-bold text-green-600 text-lg">${p.price}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Stock</span>
                            <p className={`font-bold text-lg ${p.stock < 20 ? 'text-red-600' : 'text-blue-600'}`}>
                              {p.stock}
                              {p.stock < 20 && <span className="text-xs ml-1">⚠️ Low</span>}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">ID</span>
                            <p className="font-mono text-sm">{p._id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex flex-col gap-2 justify-start md:justify-center">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setForm({
                              name: p.name,
                              description: p.description,
                              price: p.price,
                              category: p.category,
                              image: p.image,
                              stock: p.stock,
                            });
                            window.scrollTo(0, 0);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders */}
      {tab === "orders" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-3">
              <label className="font-semibold text-gray-700">🔍 Search Order:</label>
              <input
                type="text"
                placeholder="Enter Order ID (e.g., 691b...)"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition"
              />
              {searchOrderId && (
                <button
                  onClick={() => setSearchOrderId("")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {/* Pending/Active Orders */}
          <div>
            <h2 className="text-2xl font-bold mb-4">📋 Active Orders ({orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && (o._id?.toLowerCase()||'').includes(searchOrderId.toLowerCase())).length})</h2>

            {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && (o._id?.toLowerCase()||'').includes(searchOrderId.toLowerCase())).length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                {searchOrderId ? 'No matching active orders found' : 'No active orders'}
              </div>
            ) : (
              orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled' && (o._id?.toLowerCase()||'').includes(searchOrderId.toLowerCase())).map((order) => {
                const orderDate = new Date(order.createdAt);
                const today = new Date();
                const isToday = orderDate.toDateString() === today.toDateString();
                
                return (
                <div key={order._id} className={`p-6 rounded-lg shadow mb-4 ${isToday ? 'bg-blue-50 border-2 border-blue-400' : 'bg-white'}`}>
                  {isToday && (
                    <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                      🆕 TODAY'S ORDER
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-lg mb-2">Order #{order._id}</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">
                          <span className="font-semibold">👤 Customer:</span> {order.user?.name || order.shippingInfo?.fullName || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">✉️ Email:</span> {order.user?.email || order.shippingInfo?.email || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">📞 Phone:</span> {order.shippingInfo?.phone || "N/A"}
                        </p>
                        <div className="mt-2">
                          <p className={`text-xs font-semibold ${isToday ? 'text-blue-700' : 'text-gray-500'}`}>
                            🕒 {orderDate.toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {isToday && (
                            <p className="text-xs text-blue-600 font-bold mt-1">
                              ⏰ {orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="border rounded px-3 py-2 text-sm font-semibold"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📍 Shipping Address</h4>
                    <p className="text-gray-700 text-sm">
                      {order.shippingInfo?.houseNo}, {order.shippingInfo?.street}
                    </p>
                    <p className="text-gray-700 text-sm">
                      {order.shippingInfo?.landmark && `Near ${order.shippingInfo.landmark}, `}
                      {order.shippingInfo?.nearBy && `${order.shippingInfo.nearBy}`}
                    </p>
                    <p className="text-gray-700 text-sm">
                      {order.shippingInfo?.city}, {order.shippingInfo?.district}, {order.shippingInfo?.state} - {order.shippingInfo?.pincode}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-3">📦 Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((i, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <div>
                            <p className="font-semibold">{i.name}</p>
                            <p className="text-gray-600 text-sm">Qty: {i.quantity}</p>
                          </div>
                          <p className="font-bold">
                            ${(i.price * i.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 flex justify-between items-center font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-green-600">${order.total?.toFixed(2) || "0.00"}</span>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span> Delete Order
                  </button>
                </div>
                );
              })
            )}
          </div>

          {/* Delivered Orders */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-green-700">✅ Delivered Orders ({orders.filter(o => o.status === 'Delivered' && (o._id?.toLowerCase()||'').includes(searchOrderId.toLowerCase())).length})</h2>

            {orders.filter(o => o.status === 'Delivered' && (o._id?.toLowerCase()||'').includes(searchOrderId.toLowerCase())).length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                {searchOrderId ? 'No matching delivered orders found' : 'No delivered orders yet'}
              </div>
            ) : (
              orders.filter(o => o.status === 'Delivered' && (o._id?.toLowerCase()||'').includes(searchOrderId.toLowerCase())).map((order) => {
                const orderDate = new Date(order.createdAt);
                return (
                <div key={order._id} className="bg-green-50 p-6 rounded-lg shadow mb-4 border-2 border-green-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-lg mb-2 flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        Order #{order._id}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">
                          <span className="font-semibold">👤 Customer:</span> {order.user?.name || order.shippingInfo?.fullName || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">✉️ Email:</span> {order.user?.email || order.shippingInfo?.email || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">📞 Phone:</span> {order.shippingInfo?.phone || "N/A"}
                        </p>
                        <p className="text-green-700 text-xs mt-2 font-semibold">
                          🕒 Ordered: {orderDate.toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                      Delivered ✓
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-green-900 mb-2">📍 Shipping Address</h4>
                    <p className="text-gray-700 text-sm">
                      {order.shippingInfo?.houseNo}, {order.shippingInfo?.street}
                    </p>
                    <p className="text-gray-700 text-sm">
                      {order.shippingInfo?.landmark && `Near ${order.shippingInfo.landmark}, `}
                      {order.shippingInfo?.nearBy && `${order.shippingInfo.nearBy}`}
                    </p>
                    <p className="text-gray-700 text-sm">
                      {order.shippingInfo?.city}, {order.shippingInfo?.district}, {order.shippingInfo?.state} - {order.shippingInfo?.pincode}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-3">📦 Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((i, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                          <div>
                            <p className="font-semibold">{i.name}</p>
                            <p className="text-gray-600 text-sm">Qty: {i.quantity}</p>
                          </div>
                          <p className="font-bold">
                            ${(i.price * i.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 flex justify-between items-center font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-green-600">${order.total?.toFixed(2) || "0.00"}</span>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span> Delete Order
                  </button>
                </div>
                );
              })
            )}
          </div>

          {/* Cancelled Orders */}
          {orders.filter(o => o.status === 'Cancelled' && (o._id?.toLowerCase()||'').includes(searchOrderId.toLowerCase())).length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-red-700">❌ Cancelled Orders ({orders.filter(o => o.status === 'Cancelled' && (o._id?.toLowerCase()||'').includes(searchOrderId.toLowerCase())).length})</h2>

              {orders.filter(o => o.status === 'Cancelled' && (o._id?.toLowerCase()||'').includes(searchOrderId.toLowerCase())).map((order) => {
                const orderDate = new Date(order.createdAt);
                return (
                <div key={order._id} className="bg-red-50 p-6 rounded-lg shadow mb-4 border-2 border-red-200 opacity-75">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-lg mb-2 flex items-center gap-2">
                        <span className="text-red-600">❌</span>
                        Order #{order._id}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">
                          <span className="font-semibold">👤 Customer:</span> {order.user?.name || order.shippingInfo?.fullName || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">✉️ Email:</span> {order.user?.email || order.shippingInfo?.email || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">📞 Phone:</span> {order.shippingInfo?.phone || "N/A"}
                        </p>
                        <p className="text-red-700 text-xs mt-2 font-semibold">
                          🕒 {orderDate.toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                      Cancelled
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 flex justify-between items-center font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-red-600">${order.total?.toFixed(2) || "0.00"}</span>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="mt-4 w-full bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span> Delete Order
                  </button>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">All Users</h2>

          <div className="bg-white p-6 rounded-lg shadow overflow-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-center">Role</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="text-center capitalize">{u.role}</td>
                    <td className="text-center">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
