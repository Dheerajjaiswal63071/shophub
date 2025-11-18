import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import ProductCard from "../components/products/ProductCard";
import ProductFilterBar from "../components/products/ProductFilterBar";

export default function ProductsPage() {
  const { products, loadProducts } = useApp();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchesText =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesCat = category === "All" || p.category === category;

    return matchesText && matchesCat;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-2 text-gray-800">🛍️ All Products</h1>
      <p className="text-gray-600 mb-8">Discover our amazing collection of products</p>

      <ProductFilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-lg">No products found...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
