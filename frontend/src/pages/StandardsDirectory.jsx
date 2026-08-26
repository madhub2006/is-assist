import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Filter, ChevronRight, Eye, ShieldCheck } from "lucide-react";
import { standardsService } from "../services/standardsService";
import { Breadcrumb, Table, LoadingState, ErrorState } from "../components/common/FeedbackAndNavigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/common/Card";
import { StatusBadge, Badge } from "../components/common/Badge";
import { PrototypeBanner } from "../components/common/Indicators";

export function StandardsDirectory() {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");

  const loadStandards = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await standardsService.listStandards({
        query: searchQuery || undefined,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        sector: selectedSector !== "All" ? selectedSector : undefined,
      });
      setStandards(data);
    } catch (err) {
      setError("Failed to load standards registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStandards();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedSector]);

  const categories = [
    "All",
    "Electrical & Electronics",
    "Heavy Engineering",
    "Civil Engineering & Piping",
    "Metallurgy & Steel",
    "Personal Protective Equipment",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Standards Directory" },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight">
              Indian Standards (IS) Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated registry of Indian Standards, specifications, versions, amendments, and normative references.
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-lg border border-blue-200 inline-flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Demo BIS Dataset (Phase 1)
          </span>
        </div>
      </div>

      <PrototypeBanner message="All standards shown are clearly marked demonstration entries with prefix DEMO-IS- to represent Indian Standards architecture." />

      {/* Search & Filter Controls */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by IS number, title, keywords (e.g. 10322, LED, Transformer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white"
            >
              <option value="All">All Categories</option>
              {categories.slice(1).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center justify-end">
            <span className="text-xs text-slate-500 font-semibold">
              Found <span className="text-slate-900">{standards.length}</span> Standards
            </span>
          </div>
        </div>
      </Card>

      {/* Standards Listing Table */}
      {loading ? (
        <LoadingState message="Searching standards directory..." />
      ) : error ? (
        <ErrorState title="Error Loading Directory" message={error} onRetry={loadStandards} />
      ) : (
        <Card>
          <Table className="gov-table">
            <thead>
              <tr>
                <th>IS Number</th>
                <th>Standard Title & Scope</th>
                <th>Category</th>
                <th>Sector</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {standards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No standards matched your search query.
                  </td>
                </tr>
              ) : (
                standards.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                      {s.is_number}
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900 text-xs">{s.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{s.scope}</p>
                    </td>
                    <td>
                      <Badge variant="primary">{s.category}</Badge>
                    </td>
                    <td className="text-xs text-slate-600 whitespace-nowrap">
                      {s.sector || "General"}
                    </td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <Link
                        to={`/standards/${s.id}`}
                        className="px-3 py-1 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-md transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View Standard
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
