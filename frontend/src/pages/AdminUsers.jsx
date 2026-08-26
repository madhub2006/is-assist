import React, { useState, useEffect } from "react";
import { Users, Plus, Edit2, UserX, Shield, CheckCircle2 } from "lucide-react";
import { adminService } from "../services/adminService";
import { Breadcrumb, Table, Modal, LoadingState, ErrorState } from "../components/common/FeedbackAndNavigation";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input, Select } from "../components/common/FormElements";
import { Badge, StatusBadge } from "../components/common/Badge";
import { useToast } from "../hooks/useToast";
import { formatDateTime } from "../lib/utils";

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: 2,
    department_id: 1,
    is_active: true,
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, rolesData, deptsData] = await Promise.all([
        adminService.listUsers(),
        adminService.getRoles(),
        adminService.getDepartments(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setDepartments(deptsData);
    } catch (err) {
      setError("Failed to load user administration data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role_id: roles[0]?.id || 2,
      department_id: departments[0]?.id || 1,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role_id: user.role_id,
      department_id: user.department_id || departments[0]?.id || 1,
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await adminService.updateUser(editingUserId, {
          name: formData.name,
          email: formData.email,
          role_id: Number(formData.role_id),
          department_id: Number(formData.department_id),
          is_active: formData.is_active,
          password: formData.password || undefined,
        });
        toast.success("User Updated", `Updated details for ${formData.name}`);
      } else {
        await adminService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role_id: Number(formData.role_id),
          department_id: Number(formData.department_id),
          is_active: true,
        });
        toast.success("User Created", `Added new user ${formData.name}`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error("Operation Failed", err.response?.data?.message || "Failed to save user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await adminService.deleteUser(userId);
      toast.info("User Deactivated", `${name} has been deactivated.`);
      loadData();
    } catch (err) {
      toast.error("Failed to Deactivate", "Admin accounts cannot be self-deactivated.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Administration" },
            { label: "User Management" },
          ]}
        />
        <div className="flex items-center justify-between mt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight">
              User Management & Access Control
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision user accounts, assign role permissions, and manage departmental assignments.
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            + Add Official User
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading system users and roles..." />
      ) : error ? (
        <ErrorState title="Admin Error" message={error} onRetry={loadData} />
      ) : (
        <Card>
          <Table className="gov-table">
            <thead>
              <tr>
                <th>Officer / User Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Department</th>
                <th>Account Status</th>
                <th>Last Login</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td>
                    <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                  </td>
                  <td className="text-xs font-mono text-slate-600">{u.email}</td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-navy-900 text-white">
                      {u.role?.name || "Officer"}
                    </span>
                  </td>
                  <td className="text-xs text-slate-600">
                    {u.department?.name || "General"}
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDateTime(u.last_login_at)}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-xs inline-flex items-center gap-1"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(u.id, u.name)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors text-xs"
                        title="Deactivate User"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* User Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? "Edit User Details" : "Provision New User"}
        description="Configure account credentials, department, and role permissions."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Full Name"
            placeholder="e.g. Shri Rajesh Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Official Email Address"
            type="email"
            placeholder="e.g. rajesh@isassist.gov.in"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label={isEditing ? "New Password (leave blank to keep current)" : "Temporary Password"}
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!isEditing}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">System Role</label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {isEditing ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
