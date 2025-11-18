import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function ProductCard({ product }) {
  const { addToCart, user } = useApp();

  const handleAddToCart = () => {
    if (!user) {
      alert("⚠️ Please login to add items to cart");
      return;
    }
    addToCart(product);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden group">
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300"></div>
      </Link>

      <div className="p-5">
        <Link
          to={`/product/${product._id}`}
          className="text-lg font-bold text-gray-800 hover:text-blue-600 transition line-clamp-2"
        >
          {product.name}
        </Link>

        <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-10">
          {product.description || "High quality product"}
        </p>

        <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200">
          <span className="text-xl sm:text-2xl font-bold text-blue-600">
            ${product.price?.toFixed(2) || "0.00"}
          </span>

          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-lg font-semibold shadow-md transform hover:scale-105 transition duration-200"
            onClick={handleAddToCart}
          >
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  );
}
