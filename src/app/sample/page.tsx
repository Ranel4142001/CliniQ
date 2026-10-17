"use client";

import React, { useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users,
  Activity,
  Calendar,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/shared/components/layout/AppShell";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { StatCard } from "@/shared/components/layout/StatCard";
import { DataTable, DataTableColumn } from "@/shared/components/data-table/DataTable";
import { StatusBadge, StatusMap } from "@/shared/components/feedback/StatusBadge";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import { FormDialog } from "@/shared/components/form/FormDialog";
import { TextField } from "@/shared/components/form/TextField";
import { SelectField } from "@/shared/components/form/SelectField";
import { DateField } from "@/shared/components/form/DateField";
import { TextareaField } from "@/shared/components/form/TextareaField";
import { CheckboxField } from "@/shared/components/form/CheckboxField";
import { RoleGuard } from "@/shared/components/guards/RoleGuard";
import { Button } from "@/shared/components/ui/button";
import { notify } from "@/shared/lib/notify";
import { ROLES, Role } from "@/shared/constants/roles";
import { formatDate } from "@/shared/lib/date";

// Sample data item
interface SamplePatientRecord extends Record<string, unknown> {
  id: string;
  patientNo: string;
  name: string;
  category: "General" | "Pediatric" | "Geriatric";
  status: "ACTIVE" | "PENDING" | "ARCHIVED";
  registeredDate: string;
}

const SAMPLE_STATUS_MAP: StatusMap<"ACTIVE" | "PENDING" | "ARCHIVED"> = {
  ACTIVE: { label: "Active", variant: "default", className: "bg-emerald-600 hover:bg-emerald-700" },
  PENDING: { label: "Pending", variant: "secondary" },
  ARCHIVED: { label: "Archived", variant: "outline", className: "text-muted-foreground" },
};

// Zod schema for sample modal form
const sampleFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(["General", "Pediatric", "Geriatric"], {
    message: "Please select a category",
  }),
  birthDate: z.string().min(1, "Birth date is required"),
  notes: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to continue"),
});

type SampleFormData = z.infer<typeof sampleFormSchema>;

const INITIAL_DATA: SamplePatientRecord[] = [
  { id: "1", patientNo: "PT-2026-0001", name: "Maria Santos", category: "General", status: "ACTIVE", registeredDate: "2026-10-01" },
  { id: "2", patientNo: "PT-2026-0002", name: "Juan dela Cruz", category: "Pediatric", status: "ACTIVE", registeredDate: "2026-10-03" },
  { id: "3", patientNo: "PT-2026-0003", name: "Antonio Luna", category: "Geriatric", status: "PENDING", registeredDate: "2026-10-05" },
  { id: "4", patientNo: "PT-2026-0004", name: "Gabriela Silang", category: "General", status: "ACTIVE", registeredDate: "2026-10-08" },
  { id: "5", patientNo: "PT-2026-0005", name: "Jose Rizal", category: "General", status: "ARCHIVED", registeredDate: "2026-09-15" },
];

export default function SamplePage() {
  const [data, setData] = useState<SamplePatientRecord[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formMethods = useForm<SampleFormData>({
    resolver: zodResolver(sampleFormSchema),
    defaultValues: {
      name: "",
      category: "General",
      birthDate: "",
      notes: "",
      agreeToTerms: false,
    },
  });

  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.patientNo.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const handleCreate = (values: SampleFormData) => {
    const newRecord: SamplePatientRecord = {
      id: String(Date.now()),
      patientNo: `PT-2026-000${data.length + 1}`,
      name: values.name,
      category: values.category,
      status: "ACTIVE",
      registeredDate: new Date().toISOString().split("T")[0],
    };

    setData((prev) => [newRecord, ...prev]);
    notify.success("Sample patient registered successfully!");
    setDialogOpen(false);
    formMethods.reset();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setData((prev) => prev.filter((d) => d.id !== deleteId));
    notify.success("Record deleted");
    setDeleteId(null);
  };

  const columns: DataTableColumn<SamplePatientRecord>[] = [
    { header: "Patient No.", accessorKey: "patientNo", sortable: true },
    { header: "Name", accessorKey: "name", sortable: true },
    { header: "Category", accessorKey: "category" },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} statusMap={SAMPLE_STATUS_MAP} />,
    },
    {
      header: "Registered",
      cell: (item) => formatDate(item.registeredDate),
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => notify.info(`Viewing ${item.name}`)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(item.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell
      user={{
        fullName: "Dr. Maria Cruz",
        email: "doctor@cliniq.local",
        role: ROLES.ADMIN as Role,
      }}
    >
      <PageHeader
        title="Foundation Verification"
        description="Verifying Section 7 shared building blocks: DataTable, FormDialog, StatusBadge, and Form Fields."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Foundation Verification" },
        ]}
        actions={
          <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.STAFF]} currentRole={ROLES.ADMIN}>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Record
            </Button>
          </RoleGuard>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Total Sample Records" value={data.length} icon={<Users />} />
        <StatCard title="Active Status" value={data.filter((d) => d.status === "ACTIVE").length} icon={<Activity />} />
        <StatCard title="Today's Date" value={formatDate(new Date())} icon={<Calendar />} />
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or ID..."
        pagination={{
          page,
          pageSize: 5,
          total: filteredData.length,
          totalPages: Math.ceil(filteredData.length / 5) || 1,
          onPageChange: setPage,
        }}
      />

      {/* FormDialog Verification */}
      <FormProvider {...formMethods}>
        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="New Patient Demonstration Form"
          description="Test form binding React Hook Form + Zod validation."
          onSubmit={formMethods.handleSubmit(handleCreate)}
          submitLabel="Create Record"
        >
          <TextField name="name" label="Full Name" placeholder="e.g. Juan dela Cruz" required />
          <SelectField
            name="category"
            label="Patient Category"
            options={[
              { value: "General", label: "General Medicine" },
              { value: "Pediatric", label: "Pediatrics" },
              { value: "Geriatric", label: "Geriatrics" },
            ]}
            required
          />
          <DateField name="birthDate" label="Birth Date" required />
          <TextareaField name="notes" label="Clinical / Intake Notes" placeholder="Optional notes" />
          <CheckboxField name="agreeToTerms" label="Confirm information is accurate for demo" />
        </FormDialog>
      </FormProvider>

      {/* ConfirmDialog Verification */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Record"
        description="Are you sure you want to delete this sample record? This action demonstrates ConfirmDialog."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </AppShell>
  );
}
