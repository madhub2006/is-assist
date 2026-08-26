export const APP_NAME = "IS-Assist";
export const APP_TAGLINE = "AI-Powered Indian Standards & Procurement Intelligence";

export const USER_ROLES = {
  ADMIN: "Admin",
  OFFICER: "Procurement Officer",
  REVIEWER: "Reviewer",
};

export const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@isassist.gov.in",
    password: "Admin@123456",
    name: "Shri Rajesh Sharma",
    department: "Ministry of Power & Energy",
  },
  {
    role: "Procurement Officer",
    email: "officer@isassist.gov.in",
    password: "Officer@123456",
    name: "Smt. Priya Nair",
    department: "Department of Urban Development",
  },
  {
    role: "Reviewer",
    email: "reviewer@isassist.gov.in",
    password: "Reviewer@123456",
    name: "Dr. Anil Kumar",
    department: "Public Works Department",
  },
];

export const STATUS_COLORS = {
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Review": "bg-blue-50 text-blue-700 border-blue-200",
  "Draft": "bg-amber-50 text-amber-700 border-amber-200",
  "Processing": "bg-purple-50 text-purple-700 border-purple-200",
  "Needs Clarification": "bg-rose-50 text-rose-700 border-rose-200",
  "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Superseded": "bg-slate-100 text-slate-700 border-slate-300",
  "Withdrawn": "bg-red-50 text-red-700 border-red-200",
  "Provided": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Missing": "bg-rose-50 text-rose-700 border-rose-200",
  "Needs Review": "bg-amber-50 text-amber-700 border-amber-200",
};

export const SEVERITY_CONFIG = {
  "CRITICAL": {
    label: "Critical",
    badge: "bg-red-100 text-red-800 border-red-300",
    bg: "bg-red-50/70 border-red-200",
    iconColor: "text-red-600",
  },
  "WARNING": {
    label: "Warning",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    bg: "bg-amber-50/70 border-amber-200",
    iconColor: "text-amber-600",
  },
  "INFO": {
    label: "Information",
    badge: "bg-blue-100 text-blue-800 border-blue-300",
    bg: "bg-blue-50/70 border-blue-200",
    iconColor: "text-blue-600",
  },
  "NEEDS_VERIFICATION": {
    label: "Needs Verification",
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    bg: "bg-purple-50/70 border-purple-200",
    iconColor: "text-purple-600",
  },
};
