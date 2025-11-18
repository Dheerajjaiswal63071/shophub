import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Link } from "react-router-dom";
import orderApi from "../../api/orderApi";
import authApi from "../../api/authApi";

export default function UserPanel() {
  const { user, setUser, products, addToCart, cart } = useApp();

  const [active, setActive] = useState("overview"); // overview | shop | orders | profile
  const [orders, setOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [profile, setProfile] = useState({
    name: user?.name || "",
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

  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders().then((res) => {
      setOrders(res.data);
      setLoadingOrders(false);
    }).catch(() => {
      // No backend: keep orders empty in demo
      setOrders([]);
      setLoadingOrders(false);
    });
  }, []);

  // Keep local products in sync with context
  useEffect(() => {
    setAllProducts(products || []);
    setFilteredProducts(products || []);
  }, [products]);

  useEffect(() => {
    let results = allProducts;

    // Filter by search term
    if (searchTerm.trim()) {
      results = results.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      results = results.filter((p) => p.category === categoryFilter);
    }

    setFilteredProducts(results);
  }, [searchTerm, categoryFilter, allProducts]);

  const handleProfileSave = async () => {
    try {
      const res = await authApi.updateProfile(profile);
      setUser(res.data.user);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error('Profile update error:', err);
      alert("❌ Failed to update profile: " + (err.response?.data?.message || err.message));
    }
  };

  if (!user)
    return (
      <div className="py-20 text-center text-xl">
        Please login to access your dashboard
      </div>
    );

  if (user.role === "admin")
    return (
      <div className="py-20 text-center text-xl">
        Admin users should use the Admin Panel
      </div>
    );

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">👤 User Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-2 rounded-lg mb-6 overflow-x-auto">
        {["overview", "shop", "orders", "profile"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              active === tab
                ? "bg-white shadow font-semibold text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab === "overview" ? "📊 Overview" : tab === "shop" ? "🛍️ Shop" : tab === "orders" ? "📦 Orders" : "👤 Profile"}
          </button>
        ))}
      </div>

      {/* Overview */}
      {active === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Orders */}
            <div className="bg-blue-600 text-white p-6 rounded-lg">
              <h2 className="text-lg">Total Orders</h2>
              <p className="text-4xl font-bold">{orders.length}</p>
            </div>

            {/* Total Spent */}
            <div className="bg-green-600 text-white p-6 rounded-lg">
              <h2 className="text-lg">Total Spent</h2>
              <p className="text-4xl font-bold">${totalSpent.toFixed(2)}</p>
            </div>

            {/* Active Orders */}
            <div className="bg-purple-600 text-white p-6 rounded-lg">
              <h2 className="text-lg">Active Orders</h2>
              <p className="text-4xl font-bold">
                {orders.filter((o) => o.status !== "Delivered").length}
              </p>
            </div>
          </div>

          {/* Welcome Box */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Welcome, {user.name}!</h2>
            <p className="text-gray-600">Here is your account overview:</p>
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "Not set"}</p>
              <p><strong>Address:</strong> {
                user.houseNo || user.street || user.city ? (
                  <>
                    {user.houseNo && `${user.houseNo}, `}
                    {user.street && `${user.street}, `}
                    {user.landmark && `Near ${user.landmark}, `}
                    {user.nearBy && `${user.nearBy}, `}
                    {user.city && `${user.city}, `}
                    {user.district && `${user.district}, `}
                    {user.state && `${user.state} - `}
                    {user.pincode}
                  </>
                ) : "Not set"
              }</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>

            {orders.slice(0, 3).map((order) => (
              <div key={order._id} className="border-b py-4 last:border-none">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold">Order #{order._id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                    {order.status}
                  </span>
                </div>

                <p className="font-bold mt-2">${order.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shop - Browse Products */}
      {active === "shop" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-6">🛍️ Shop All Products</h2>

          {/* Search & Filter */}
          <div className="bg-white p-6 rounded-lg shadow-lg sticky top-24 z-40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 Search Products</label>
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📂 Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="all">All Categories</option>
                  {[...new Set(allProducts.map((p) => p.category))].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-2xl text-gray-400">😕 No products found</p>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-2xl transition overflow-hidden transform hover:scale-105">
                      {/* Product Image */}
                      <div className="relative overflow-hidden bg-gray-200 h-48">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-110 transition duration-300"
                        />
                        {product.stock < 10 && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                            Only {product.stock} left!
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>

                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-semibold text-blue-600">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Price</p>
                            <p className="text-2xl font-bold text-green-600">${product.price}</p>
                          </div>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition ${
                                product.stock > 20 ? "bg-green-500" : product.stock > 5 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{product.stock} in stock</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              addToCart(product);
                              alert(`✅ ${product.name} added to cart!`);
                            }}
                            disabled={product.stock === 0}
                            className={`flex-1 py-2 rounded-lg font-semibold transition ${
                              product.stock === 0
                                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105"
                            }`}
                          >
                            {product.stock === 0 ? "Out of Stock" : "🛒 Add to Cart"}
                          </button>

                          <Link
                            to={`/product/${product._id}`}
                            className="flex-1 py-2 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition text-center"
                          >
                            👀 View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Orders */}
      {active === "orders" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">My Orders</h2>

          {loadingOrders ? (
            <div className="py-20 text-center animate-pulse">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-gray-500 text-lg py-10 text-center">
              No orders yet.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-6 rounded-lg shadow mb-4"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-lg">Order #{order._id}</p>
                    <p className="text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Profile */}
      {active === "profile" && (
        <div className="bg-white p-6 rounded-lg shadow max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border p-2 rounded"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full border p-2 rounded"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full border p-2 rounded"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="House/Flat No."
                className="w-full border p-2 rounded"
                value={profile.houseNo}
                onChange={(e) => setProfile({ ...profile, houseNo: e.target.value })}
              />

              <input
                type="text"
                placeholder="Street/Area"
                className="w-full border p-2 rounded"
                value={profile.street}
                onChange={(e) => setProfile({ ...profile, street: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Landmark"
                className="w-full border p-2 rounded"
                value={profile.landmark}
                onChange={(e) => setProfile({ ...profile, landmark: e.target.value })}
              />

              <input
                type="text"
                placeholder="Near By (e.g., Temple, School)"
                className="w-full border p-2 rounded"
                value={profile.nearBy}
                onChange={(e) => setProfile({ ...profile, nearBy: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                className="w-full border p-2 rounded"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              />

              <input
                type="text"
                placeholder="District"
                className="w-full border p-2 rounded"
                value={profile.district}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="State"
                className="w-full border p-2 rounded"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              />

              <input
                type="text"
                placeholder="PIN Code"
                className="w-full border p-2 rounded"
                value={profile.pincode}
                onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                pattern="[0-9]{6}"
                title="Please enter a valid 6-digit PIN code"
              />
            </div>

            <button
              onClick={handleProfileSave}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 w-full"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
