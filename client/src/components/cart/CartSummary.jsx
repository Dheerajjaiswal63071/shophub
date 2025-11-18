import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const CartSummary = () => {
  const { cart } = useContext(AppContext);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 9.99 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h3>
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal:</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping:</span>
          <span className="font-semibold">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (10%):</span>
          <span className="font-semibold">${tax.toFixed(2)}</span>
        </div>
        <div className="border-t-2 border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-800">
          <span>Total:</span>
          <span className="text-blue-600">${total.toFixed(2)}</span>
        </div>
      </div>
      <Link
        to="/checkout"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-bold text-center shadow-md transform hover:scale-105 transition duration-200 block"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
};

export default CartSummary;
