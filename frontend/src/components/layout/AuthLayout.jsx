import React from "react";
import { Outlet } from "react-router-dom";
import { Layers, ShieldCheck, CheckCircle2, FileSearch } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "../../lib/constants";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          
          {/* Left Hero/Branding Column (Enterprise Navy) */}
          <div className="md:col-span-5 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-display tracking-tight text-white">{APP_NAME}</h1>
                  <span className="text-[10px] text-blue-300 tracking-wider uppercase font-semibold">Phase 1 Foundation</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <h2 className="text-lg font-bold text-slate-100 leading-snug">
                  AI-Powered Indian Standards & Procurement Intelligence
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Empowering government departments, PSUs, and procurement officials to analyze specifications, identify relevant Indian Standards (IS), and detect technical gaps.
                </p>
              </div>

              <div className="mt-8 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Comprehensive Indian Standards (IS) Directory</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <FileSearch className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>PyMuPDF Tender Document Extraction</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Specification Readiness & Risk Analysis</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-navy-800/80 text-[11px] text-slate-400">
              Security Notice: System access is restricted to authorized personnel. All transactions are audit-logged.
            </div>

            {/* Subtle background geometric pattern */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
          </div>

          {/* Right Form Column */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
            <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
}
