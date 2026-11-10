"use client";

import React, { useEffect, useState } from "react";
import { Plus, List, Calendar as CalendarIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useAppointments,
  useBookAppointment,
  useRescheduleAppointment,
  useUpdateAppointmentStatus,
  AppointmentTable,
  AppointmentCalendar,
  BookAppointmentForm,
} from "@/features/appointments";
import type { BookAppointmentInput } from "@backend/contracts";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

const FILTERABLE_STATUSES = new Set(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]);

export default function AppointmentsPage() {
  const { user } = useCurrentUser();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isBookOpen, setIsBookOpen] = useState(false);

  // Dashboard shortcuts open this page on a view or status, e.g. ?status=PENDING or ?view=calendar.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status && FILTERABLE_STATUSES.has(status)) setStatusFilter(status);
    if (params.get("view") === "calendar") setViewMode("calendar");
  }, []);

  const { data, isLoading, error, refetch } = useAppointments({
    page,
    pageSize: 10,
    status: statusFilter,
  });

  const bookMutation = useBookAppointment();
  const rescheduleMutation = useRescheduleAppointment();
  const updateStatusMutation = useUpdateAppointmentStatus();

  const handleBook = async (input: BookAppointmentInput) => {
    await bookMutation.mutateAsync(input);
    setIsBookOpen(false);
  };

  const handleConfirm = async (id: string, meetingUrl?: string) => {
    await updateStatusMutation.mutateAsync({
      id,
      data: { status: "CONFIRMED", meetingUrl },
    });
  };

  const handleCancel = async (id: string, reason: string) => {
    await updateStatusMutation.mutateAsync({
      id,
      data: { status: "CANCELLED", cancelReason: reason },
    });
  };

  const handleReschedule = async (id: string, newScheduledAt: string) => {
    await rescheduleMutation.mutateAsync({
      id,
      data: { scheduledAt: newScheduledAt },
    });
  };

  const handleNoShow = async (id: string) => {
    await updateStatusMutation.mutateAsync({
      id,
      data: { status: "NO_SHOW" },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        feature={ROUTES.APPOINTMENTS}
        title="Appointments"
        description="Book, confirm, and manage patient visits."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border bg-muted p-0.5">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-9 gap-1.5 px-2.5 text-xs lg:h-7"
              >
                <List className="h-3.5 w-3.5" /> Table
              </Button>
              <Button
                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="h-9 gap-1.5 px-2.5 text-xs lg:h-7"
              >
                <CalendarIcon className="h-3.5 w-3.5" /> Calendar
              </Button>
            </div>
            <Button onClick={() => setIsBookOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Book Appointment
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { label: "All Statuses", value: undefined },
          { label: "Pending", value: "PENDING" },
          { label: "Confirmed", value: "CONFIRMED" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Cancelled", value: "CANCELLED" },
        ].map((item) => (
          <Button
            key={item.label}
            variant={statusFilter === item.value ? "secondary" : "ghost"}
            size="sm"
            className={`h-9 text-xs lg:h-7 ${statusFilter === item.value ? "border font-semibold" : ""}`}
            onClick={() => {
              setStatusFilter(item.value);
              setPage(1);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {viewMode === "table" ? (
        <AppointmentTable
          data={data?.items ?? []}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          page={page}
          pageSize={10}
          total={data?.meta?.total ?? 0}
          totalPages={data?.meta?.totalPages ?? 1}
          onPageChange={setPage}
          userRole={user?.role}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onReschedule={handleReschedule}
          onNoShow={handleNoShow}
          isUpdating={updateStatusMutation.isPending || rescheduleMutation.isPending}
        />
      ) : (
        <AppointmentCalendar appointments={data?.items ?? []} />
      )}

      <Dialog open={isBookOpen} onOpenChange={setIsBookOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <BookAppointmentForm
              userRole={user?.role}
              onSubmit={handleBook}
              onCancel={() => setIsBookOpen(false)}
              isSubmitting={bookMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
