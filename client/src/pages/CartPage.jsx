import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty } = useApp();
  const navigate = useNavigate();

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
        <Link
          to="/products"
          className="bg-blue-600 px-6 py-2 rounded text-white hover:bg-blue-700"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        {cart.map((item) => (
          <div
            key={item._id}
            className="bg-white p-4 rounded shadow mb-4 flex gap-4"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 object-cover rounded"
            />

            <div className="flex-1">
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-gray-600">${item.price}</p>

              <div className="flex gap-2 items-center mt-3">
                <button
                  onClick={() => updateCartQty(item._id, item.quantity - 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                  type="button"
                >
                  -
                </button>

                <span className="text-lg font-semibold px-2">{item.quantity}</span>

                <button
                  onClick={() => updateCartQty(item._id, item.quantity + 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                  type="button"
                >
                  +
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromCart(item._id);
                  }}
                  className="text-white bg-red-600 px-4 py-1 rounded ml-4 hover:bg-red-700"
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="font-bold text-xl">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white p-6 rounded shadow h-fit sticky top-20">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded w-full hover:bg-blue-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
