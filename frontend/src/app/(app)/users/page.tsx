"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { UserPlus } from "lucide-react";
import type { UserProfile } from "@backend/contracts";
import { UserTable } from "@/features/users/components/UserTable";

interface CreateUserForm {
  fullName: string;
  email: string;
  password: string;
  role: "ADMIN" | "CLINICIAN" | "STAFF";
}

function useUsers(search?: string, page = 1) {
  return useQuery({
    queryKey: ["users", search, page],
    queryFn: async () => {
      const res = await apiClient.get<UserProfile[]>("/api/users", {
        params: { search, page, pageSize: 10 },
      });
      return {
        items: res.data ?? [],
        meta: (res.meta ?? { total: 0, page: 1, pageSize: 10, totalPages: 1 }) as {
          total: number;
          page: number;
          pageSize: number;
          totalPages: number;
        },
      };
    },
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
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
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<CreateUserForm>({
    fullName: "",
    email: "",
    password: "",
    role: "STAFF",
  });

  const { data, isLoading, error, refetch } = useUsers(search, page);
  const users = data?.items ?? [];
  const meta = data?.meta;
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
        description="Manage staff, clinician, and admin accounts."
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <UserTable
        users={users ?? []}
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={refetch}
        pagination={{
          page,
          pageSize: meta?.pageSize ?? 10,
          total: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setPage,
        }}
        onEditRole={setEditingUser}
        onToggleActive={setDeactivatingUser}
      />

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
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as CreateUserForm["role"] })}
              >
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
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
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
                Changing role for:{" "}
                <span className="font-medium text-foreground">{editingUser.fullName}</span>
              </p>
              <Select defaultValue={editingUser.role} onValueChange={(v) => handleUpdateRole(v)}>
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
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
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
