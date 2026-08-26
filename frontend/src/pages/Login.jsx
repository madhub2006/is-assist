import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { DEMO_ACCOUNTS } from "../lib/constants";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/FormElements";

export function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email address and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome Back", "Successfully authenticated session.");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail?.message || "Invalid email or password.";
      setError(msg);
      toast.error("Authentication Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoAcc) => {
    setEmail(demoAcc.email);
    setPassword(demoAcc.password);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-display tracking-tight">
          Procurement Portal Sign In
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Access the Indian Standards & Procurement Intelligence Platform
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Official Email Address"
          type="email"
          placeholder="officer@isassist.gov.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <Link to="/forgot-password" tabIndex={-1} className="text-[11px] text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-navy-900 transition-colors"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 mt-2"
          loading={loading}
        >
          Sign In to IS-Assist
        </Button>
      </form>

      {/* Demo Credentials Quick Switcher */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Demo Role Accounts (Click to autofill):</span>
        </div>

        <div className="space-y-1.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => handleQuickLogin(acc)}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-left flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-slate-900 block">{acc.role}</span>
                <span className="text-[11px] text-slate-500">{acc.email}</span>
              </div>
              <span className="text-[10px] text-blue-600 font-semibold">Autofill →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
