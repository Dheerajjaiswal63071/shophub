import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import productApi from "../api/productApi";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, user } = useApp();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  const handleAddToCart = () => {
    if (!user) {
      alert("⚠️ Please login to add items to cart");
      return;
    }
    addToCart(product, qty);
  };

  useEffect(() => {
    productApi.getById(id).then((res) => setProduct(res.data));
  }, [id]);

  if (!product)
    return (
      <div className="text-center py-20">
        <div className="animate-pulse">Loading...</div>
      </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
      {/* Image */}
      <img
        src={product.image}
        alt={product.name}
        className="rounded-lg shadow"
      />

      {/* Info */}
      <div>
        <h1 className="text-4xl font-bold">{product.name}</h1>

        <p className="text-gray-600 mt-4">{product.description}</p>

        <p className="text-3xl font-bold text-blue-600 mt-6">
          ${product.price}
        </p>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="px-3 py-1 border rounded"
          >
            -
          </button>

          <span className="text-xl">{qty}</span>

          <button
            onClick={() => setQty(qty + 1)}
            className="px-3 py-1 border rounded"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
