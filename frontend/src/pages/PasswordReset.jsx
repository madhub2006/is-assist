import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/FormElements";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Link to="/login" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
      </Link>

      <div>
        <h2 className="text-xl font-bold text-slate-900 font-display tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your official government email to receive password reset instructions.
        </p>
      </div>

      {submitted ? (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Password Reset Link Dispatched
          </div>
          <p>
            If an account exists for <span className="font-semibold">{email}</span>, a secure password reset link has been dispatched.
          </p>
          <Link to="/login" className="inline-block pt-2 text-blue-700 font-bold hover:underline">
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Official Email Address"
            type="email"
            placeholder="officer@isassist.gov.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full py-2.5">
            Send Reset Instructions
          </Button>
        </form>
      )}
    </div>
  );
}

export function ResetPassword() {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Set New Password</h2>
      <p className="text-xs text-slate-500">Enter a secure new password for your IS-Assist account.</p>
      <Link to="/login" className="text-xs text-blue-600 hover:underline">Back to Login</Link>
    </div>
  );
}
