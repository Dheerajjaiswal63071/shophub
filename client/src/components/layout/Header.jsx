import { Link } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function Header() {
  const { user, logout, cart } = useApp();
  const [open, setOpen] = useState(false);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const NavLinks = () => (
    <>
      {user?.role !== "admin" && (
        <>
          <Link to="/" className="hover:text-blue-100 transition duration-200" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/products" className="hover:text-blue-100 transition duration-200" onClick={() => setOpen(false)}>Products</Link>
          <Link to="/cart" className="relative hover:text-blue-100 transition duration-200 flex items-center gap-2" onClick={() => setOpen(false)}>
            🛒 Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>
        </>
      )}
      {!user ? (
        <Link to="/login" className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100" onClick={() => setOpen(false)}>Login</Link>
      ) : user.role === "admin" ? (
        <>
          <Link to="/admin" className="hover:text-blue-100 transition duration-200 font-semibold" onClick={() => setOpen(false)}>🔧 Admin</Link>
          <button onClick={() => { logout(); setOpen(false); }} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded transition duration-200">Logout</button>
        </>
      ) : (
        <>
          <Link to="/user" className="hover:text-blue-100 transition duration-200" onClick={() => setOpen(false)}>Dashboard</Link>
          <button onClick={() => { logout(); setOpen(false); }} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded transition duration-200">Logout</button>
        </>
      )}
    </>
  );

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold tracking-tight hover:text-blue-100 transition" onClick={() => setOpen(false)}>
          🛍️ ShopHub
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
          <NavLinks />
        </nav>
        {/* Mobile toggle */}
        <button
          aria-label="Toggle navigation"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm"
          onClick={() => setOpen(o => !o)}
        >
          {open ? '✖' : '☰'}
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-blue-700/95 backdrop-blur-sm border-t border-blue-500">
          <div className="px-4 py-4 flex flex-col gap-4 text-sm">
            <NavLinks />
          </div>
        </div>
      )}
    </header>
  );
}
