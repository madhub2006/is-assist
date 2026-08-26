import React from "react";
import { Link } from "react-router-dom";
import { Layers, ArrowLeft } from "lucide-react";
import { Button } from "../components/common/Button";

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center mb-4">
        <Layers className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 font-display">404 - Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The requested procurement intelligence module or analysis record could not be found.
      </p>
      <Link to="/" className="mt-5">
        <Button variant="primary" icon={ArrowLeft}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
