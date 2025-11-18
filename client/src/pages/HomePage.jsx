import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ProductCard from "../components/products/ProductCard";

export default function HomePage() {
  const { products, loadProducts } = useApp();

  useEffect(() => {
    loadProducts();
  }, []);

  const featured = products.slice(0, 4);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white py-24 text-center rounded-xl shadow-2xl mb-12">
        <h1 className="text-6xl font-bold mb-4">Welcome to ShopHub</h1>
        <p className="text-2xl mb-8 text-blue-100">Discover amazing products at unbeatable prices</p>

        <Link
          to="/products"
          className="bg-white text-blue-700 px-10 py-4 rounded-lg font-bold hover:bg-blue-50 shadow-lg inline-block transform hover:scale-105 transition duration-200"
        >
          🛍️ Shop Now
        </Link>
      </section>

      {/* Featured Products */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Featured Products</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
