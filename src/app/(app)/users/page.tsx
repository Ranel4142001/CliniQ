"use client";

import React, { useState } from "react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { ErrorState } from "@/shared/components/feedback/ErrorState";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import { notify } from "@/shared/lib/notify";
import { UserPlus, Shield, Edit2, UserX, UserCheck } from "lucide-react";
import type { UserProfile } from "@/features/auth/types/auth.types";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200",
  CLINICIAN: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200",
  STAFF: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200",
  PATIENT: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200",
};

interface CreateUserForm {
  fullName: string;
  email: string;
  password: string;
  role: "ADMIN" | "CLINICIAN" | "STAFF";
}

function useUsers(search?: string) {
  return useQuery({
    queryKey: ["users", search],
    queryFn: async () => {
      const res = await apiClient.get<UserProfile[]>("/api/users", {
        params: { search, pageSize: 50 },
      });
      return res.data ?? [];
    },
  });
}

function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUserForm) => {
      const res = await apiClient.post<UserProfile>("/api/users", input);
      return res.data;
    },
    onSuccess: () => {
      notify.success("User account created successfully");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: Error) => notify.error(err.message || "Failed to create user"),
  });
}

function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { role?: string; isActive?: boolean }) => {
      const res = await apiClient.patch<UserProfile>(`/api/users/${id}`, input);
      return res.data;
    },
    onSuccess: () => {
      notify.success("User updated");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: Error) => notify.error(err.message || "Failed to update user"),
  });
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<CreateUserForm>({
    fullName: "",
    email: "",
    password: "",
    role: "STAFF",
  });

  const { data: users, isLoading, error, refetch } = useUsers(search);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(editingUser?.id || "");
  const deactivateMutation = useUpdateUser(deactivatingUser?.id || "");

  const handleCreate = async () => {
    if (!form.fullName || !form.email || !form.password) {
      notify.error("Please fill in all required fields");
      return;
    }
    await createMutation.mutateAsync(form);
    setIsCreateOpen(false);
    setForm({ fullName: "", email: "", password: "", role: "STAFF" });
  };

  const handleUpdateRole = async (newRole: string) => {
    if (!editingUser) return;
    await updateMutation.mutateAsync({ role: newRole });
    setEditingUser(null);
  };

  const handleToggleActive = async () => {
    if (!deactivatingUser) return;
    await deactivateMutation.mutateAsync({ isActive: !deactivatingUser.isActive });
    setDeactivatingUser(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage clinic staff, clinicians, and administrator accounts"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }]}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Add User
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && <LoadingState message="Loading users…" />}
      {error && (
        <ErrorState
          title="Failed to load users"
          message={(error as Error).message}
          onRetry={refetch}
        />
      )}

      {users && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{u.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[u.role] || ROLE_COLORS.PATIENT}`}>
                      <Shield className="h-2.5 w-2.5" />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.isActive ? "default" : "secondary"} className={u.isActive ? "bg-emerald-600 text-white" : ""}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setEditingUser(u)}
                        title="Change role"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${u.isActive ? "text-destructive hover:text-destructive" : "text-emerald-600 hover:text-emerald-700"}`}
                        onClick={() => setDeactivatingUser(u)}
                        title={u.isActive ? "Deactivate user" : "Activate user"}
                      >
                        {u.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input
                placeholder="e.g. Dr. Juan Dela Cruz"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="user@cliniq.local"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Password *</Label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as CreateUserForm["role"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="CLINICIAN">Clinician</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      {editingUser && (
        <Dialog open={Boolean(editingUser)} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Change Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Changing role for: <span className="font-medium text-foreground">{editingUser.fullName}</span>
              </p>
              <Select
                defaultValue={editingUser.role}
                onValueChange={(v) => handleUpdateRole(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="CLINICIAN">Clinician</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="PATIENT">Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Deactivate/Activate Confirm */}
      <ConfirmDialog
        open={Boolean(deactivatingUser)}
        onOpenChange={() => setDeactivatingUser(null)}
        title={deactivatingUser?.isActive ? "Deactivate User" : "Activate User"}
        description={
          deactivatingUser?.isActive
            ? `Are you sure you want to deactivate ${deactivatingUser?.fullName}? They will no longer be able to log in.`
            : `Reactivate ${deactivatingUser?.fullName}? They will regain login access.`
        }
        confirmLabel={deactivatingUser?.isActive ? "Deactivate" : "Activate"}
        variant={deactivatingUser?.isActive ? "destructive" : "default"}
        onConfirm={handleToggleActive}
        isLoading={deactivateMutation.isPending}
      />
    </div>
  );
}
