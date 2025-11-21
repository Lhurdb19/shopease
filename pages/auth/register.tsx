"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
// import Logo from "@/components/logo";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();

  // ✅ Password rules
  const passwordRules = {
    length: form.password.length >= 6,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    symbol: /[^A-Za-z0-9]/.test(form.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const isFormComplete = form.name && form.email && form.phone && isPasswordValid;

  // ✅ Handle Register
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned non-JSON:", text);
        setError("Unexpected server response");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const msg = data.message || "Registration failed.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success("Registration successful! Please verify your email.");
      router.push(`/auth/verify?email=${form.email}`);
    } catch (err) {
      console.error("Registration exception:", err);
      setError("Failed to connect to server.");
      toast.error("Failed to connect to server.");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-10 p-4 lg:p-[100px] bg-[rgba(0,0,0,1.0)] overflow-auto">
      {/* Left Image */}
      <div className="hidden relative lg:block w-[850px] h-[600px] rounded-2xl overflow-hidden">
        <Image
          src="/store.jpg"
          alt="store"
          width={700}
          height={700}
          className="w-[850px] h-[600px] object-cover rounded-2xl"
        />
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/3 flex flex-col text-white">
        {/* ✅ Error display */}
        {error && (
          <p className="text-red-500 mb-2 text-sm">
            {error}
            {error.includes("couldn't be found") && (
              <a
                href="https://support.google.com/mail/answer/6596?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline ml-1"
              >
                LEARN MORE
              </a>
            )}
          </p>
        )}

        <div className="-mb-2 flex items-center justify-between">
          {/* ✅ Dynamic Logo */}
          <Link href="/" className="flex items-start justify-start gap-2">
            {settings?.logo ? (
              <Image
                src={settings.logo}
                alt={settings.siteName || "Logo"}
                width={200}
                height={150}
                className="rounded-md object-contain"
              />
            ) : (
              <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                <span className="text-green-600">Shop</span>Ease
              </span>
            )}
            {!settings?.logo && <span className="sr-only">{settings?.siteName || "ShopEase"}</span>}
          </Link>
          <Link href="/auth/login">
            <p className="text-[#196D1A] hover:text-[#fff] font-thin text-[10px] lg:text-sm xl:text-sm">
              Already Registered? Login.
            </p>
          </Link>
        </div>

        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-3 w-auto h-auto border border-[#196d1a] rounded-xl p-3 bg-gray-900"
        >
          <h2 className="text-xl lg:text-2xl xl:text-2xl font-bold">Create Account</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-1 lg:p-3 text-[#fff] border border-gray-500 rounded focus:ring-2 focus:ring-[#196D1A]"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-1 lg:p-3 text-[#fff] border border-gray-500 rounded focus:ring-2 focus:ring-[#196D1A]"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-1 lg:p-3 text-[#fff] border border-gray-500 rounded focus:ring-2 focus:ring-[#196D1A]"
              required
            />

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-1 lg:p-3 text-[#fff] border border-gray-500 rounded focus:ring-2 focus:ring-[#196D1A] pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Password Rules */}
          {/* Password Rules */}
          <div className="text-sm mb-2 mt-1 grid grid-cols-2 sm:grid-cols-1 gap-1 lg:gap-2">
            {Object.entries(passwordRules).map(([rule, valid]) => (
              <div key={rule} className="flex items-center gap-1 lg:gap-2">
                {valid ? (
                  <CheckCircle className="text-[#196D1A]" size={10} />
                ) : (
                  <XCircle className="text-red-500" size={10} />
                )}
                <span className="text-[8px] sm:text-xs lg:text-sm">
                  {rule === "length" && "At least 6 characters"}
                  {rule === "uppercase" && "At least 1 uppercase letter"}
                  {rule === "lowercase" && "At least 1 lowercase letter"}
                  {rule === "number" && "At least 1 number"}
                  {rule === "symbol" && "At least 1 special symbol"}
                </span>
              </div>
            ))}
          </div>


          {/* Role Selector */}
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full text-[#fff] bg-gray-800 border border-gray-500 p-1 lg:p-3 rounded text-[12px] focus:ring-2 focus:ring-[#196D1A]"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormComplete || loading}
            className={`bg-[#196D1A] text-white p-1 lg:p-3 rounded hover:bg-green-600 transition ${(!isFormComplete || loading) && "opacity-70 cursor-not-allowed"
              }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 my-1">
            <span className="flex-1 border border-gray-500"></span>
            <span className="text-[10px] lg:text-sm text-gray-400">or connect with</span>
            <span className="flex-1 border border-gray-500"></span>
          </div>

          {/* Google Sign-Up */}
          <button
            type="button"
            className="flex items-center justify-center gap-3 border border-gray-500 py-2 rounded hover:bg-gray-800 transition"
          >
            <Image
              src="/google-logo.png"
              alt="Google"
              width={20}
              height={20}
              className="w-3 h-3 lg:w-5 lg:h-5"
            />
            <span className="text-[10px] sm:text-xl">Continue with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}
