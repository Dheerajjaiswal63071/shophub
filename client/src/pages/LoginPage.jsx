import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import authApi from "../api/authApi";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const navigate = useNavigate();
  const { login, register } = useApp();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "login") {
        const u = await login(form.email, form.password);
        if (u && u.role === "admin") navigate("/admin");
        else navigate("/");
      } else {
        await register(form);
        alert("✅ Registration successful! Please login now.");
        setMode("login");
        setForm({
          name: "",
          email: "",
          password: "",
          phone: "",
          address: "",
        });
      }
    } catch (err) {
      alert(err.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">
        {mode === "login" ? "Login" : "Create Account"}
      </h1>

      {/* Mode Switch */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            mode === "login" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("login")}
        >
          Login
        </button>

        <button
          className={`px-4 py-2 rounded ${
            mode === "register" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border p-2 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            
            <input
              type="tel"
              placeholder="Phone Number *"
              className="w-full border p-2 rounded"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
              required
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          {mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>

      {/* Demo Credentials */}
      <div className="mt-6 bg-gray-100 p-4 rounded text-sm">
        <p className="font-semibold mb-1">Demo Accounts:</p>
        <p>Admin → admin@shophub.com / admin123</p>
      </div>
    </div>
  );
}
