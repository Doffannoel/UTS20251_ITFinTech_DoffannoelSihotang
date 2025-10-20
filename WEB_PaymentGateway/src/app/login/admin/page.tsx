// # Admin login page
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "admin@hotkicks.com",
    password: "Admin123!",
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Admin Login
        </h2>

        <div className="bg-blue-900/50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-200 mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-300">Email: admin@hotkicks.com</p>
          <p className="text-xs text-gray-300">Password: Admin123!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="Enter admin email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="Enter admin password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back to User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
