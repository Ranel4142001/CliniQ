"use client";

import React from "react";
import { Edit2, Shield, UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import type { UserProfile } from "@backend/contracts";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200",
  CLINICIAN: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200",
  STAFF: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200",
  PATIENT: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200",
};

type UserRow = UserProfile & Record<string, unknown>;

interface UserTableProps {
  users: UserProfile[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onEditRole: (user: UserProfile) => void;
  onToggleActive: (user: UserProfile) => void;
}

/** Staff accounts list: a table on larger screens, cards on phones (via DataTable). */
export function UserTable({
  users,
  isLoading,
  error,
  onRetry,
  pagination,
  onEditRole,
  onToggleActive,
}: UserTableProps) {
  const columns: DataTableColumn<UserRow>[] = [
    {
      header: "Name",
      cell: (u) => <p className="font-medium text-foreground">{u.fullName}</p>,
    },
    {
      header: "Email",
      cell: (u) => <span className="text-muted-foreground">{u.email}</span>,
    },
    {
      header: "Role",
      cell: (u) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[u.role] ?? ROLE_COLORS.PATIENT}`}
        >
          <Shield className="h-2.5 w-2.5" />
          {u.role}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (u) => (
        <Badge
          variant={u.isActive ? "default" : "secondary"}
          className={u.isActive ? "bg-emerald-600 text-white" : ""}
        >
          {u.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (u) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => onEditRole(u)}
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit role
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`h-8 gap-1.5 text-xs ${u.isActive ? "text-destructive hover:text-destructive" : "text-emerald-600 hover:text-emerald-700"}`}
            onClick={() => onToggleActive(u)}
          >
            {u.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
            {u.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<UserRow>
      data={users as UserRow[]}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No users found"
      emptyMessage="Try a different search."
      pagination={pagination}
    />
  );
}
