import React from "react";
import { ChevronLeft, ChevronRight, ChevronRight as ChevronDivider, AlertCircle, Inbox, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
export { Modal } from "./Modal";

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-x-auto border border-slate-200 rounded-lg">
      <table className={cn("w-full text-left border-collapse", className)}>
        {children}
      </table>
    </div>
  );
}

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100 sm:px-6">
      <div className="text-xs text-slate-500">
        Page <span className="font-semibold text-slate-700">{currentPage}</span> of{" "}
        <span className="font-semibold text-slate-700">{totalPages}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={cn("flex border-b border-slate-200 gap-1", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors relative whitespace-nowrap",
              isActive
                ? "border-navy-900 text-navy-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            )}
          >
            {Icon && <Icon className={cn("w-4 h-4", isActive ? "text-navy-900" : "text-slate-400")} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                "ml-1.5 px-1.5 py-0.2 rounded-full text-[10px]",
                isActive ? "bg-navy-900 text-white" : "bg-slate-100 text-slate-600"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronDivider className="w-3.5 h-3.5 text-slate-400" />}
            {item.href && !isLast ? (
              <a href={item.href} className="hover:text-slate-900 transition-colors">
                {item.label}
              </a>
            ) : (
              <span className={cn(isLast && "font-semibold text-slate-800")}>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function EmptyState({ title = "No records found", description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-300 rounded-lg">
      <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      {description && <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function LoadingState({ message = "Loading intelligence..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <Loader2 className="w-8 h-8 text-navy-900 animate-spin mb-3" />
      <p className="text-xs font-semibold text-slate-600">{message}</p>
    </div>
  );
}

export function ErrorState({ title = "Failed to load data", message, onRetry }) {
  return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-center flex flex-col items-center">
      <AlertCircle className="w-8 h-8 text-rose-600 mb-2" />
      <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
      {message && <p className="text-xs text-rose-700 mt-1 max-w-md">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-3 py-1.5 bg-white border border-rose-300 text-rose-800 text-xs font-semibold rounded-lg hover:bg-rose-100 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
