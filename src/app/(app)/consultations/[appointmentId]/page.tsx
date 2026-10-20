"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Stethoscope,
  Play,
  Save,
  CheckCircle2,
  FilePlus,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Button } from "@/shared/components/ui/button";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { ErrorState } from "@/shared/components/feedback/ErrorState";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import { StatusBadge, StatusMap } from "@/shared/components/feedback/StatusBadge";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useAppointment } from "@/features/appointments";
import { usePatient } from "@/features/patients";
import {
  useConsultationByAppointment,
  useStartConsultation,
  useUpdateConsultation,
  useCompleteConsultation,
} from "@/features/consultations";
import {
  updateConsultationSchema,
  type UpdateConsultationInput,
} from "@/features/consultations/schemas/consultation.schema";
import { MeetingPanel } from "@/features/consultations/components/MeetingPanel";
import { VitalsForm } from "@/features/consultations/components/VitalsForm";
import { ConsultationNotesForm } from "@/features/consultations/components/ConsultationNotesForm";
import { ConsultationPatientSidebar } from "@/features/consultations/components/ConsultationPatientSidebar";
import { formatDateTime } from "@/shared/lib/date";
import { notify } from "@/shared/lib/notify";

const CONSULTATION_STATUS_MAP: StatusMap<"PENDING" | "IN_PROGRESS" | "COMPLETED"> = {
  PENDING: { label: "Not Started", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "outline", className: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  COMPLETED: { label: "Completed", variant: "default", className: "bg-emerald-600 text-white" },
};

export default function ConsultationPage({
  params,
}: {
  params: { appointmentId: string };
}) {
  const { user } = useCurrentUser();
  const appointmentId = params.appointmentId;
  const [completeOpen, setCompleteOpen] = useState(false);

  const { data: appointment, isLoading: apptLoading, error: apptError } =
    useAppointment(appointmentId);
  const { data: consultation, isLoading: consultLoading } =
    useConsultationByAppointment(appointmentId);
  const { data: patient, isLoading: patientLoading } =
    usePatient(appointment?.patientId || "");

  const startMutation = useStartConsultation();
  const updateMutation = useUpdateConsultation(consultation?.id || "");
  const completeMutation = useCompleteConsultation(consultation?.id || "");

  const isClinicianOrAdmin = user?.role === "CLINICIAN" || user?.role === "ADMIN";
  const isCompleted = Boolean(consultation?.endedAt);
  const isReadOnly = !isClinicianOrAdmin || isCompleted;

  const form = useForm<UpdateConsultationInput>({
    resolver: zodResolver(updateConsultationSchema),
    defaultValues: {
      chiefComplaint: "",
      findings: "",
      diagnosis: "",
      treatmentPlan: "",
      vitals: {
        bloodPressure: "",
        temperature: undefined,
        pulseRate: undefined,
        respiratoryRate: undefined,
        oxygenSaturation: undefined,
        weight: undefined,
        height: undefined,
        bmi: undefined,
      },
    },
  });

  useEffect(() => {
    if (consultation) {
      form.reset({
        chiefComplaint: consultation.chiefComplaint || "",
        findings: consultation.findings || "",
        diagnosis: consultation.diagnosis || "",
        treatmentPlan: consultation.treatmentPlan || "",
        vitals: consultation.vitals
          ? (consultation.vitals as unknown as UpdateConsultationInput["vitals"])
          : undefined,
      });
    } else if (appointment) {
      form.setValue("chiefComplaint", appointment.reason || "");
    }
  }, [consultation, appointment, form]);

  if (apptLoading || consultLoading || (appointment && patientLoading)) {
    return <LoadingState message="Loading consultation details…" />;
  }

  if (apptError || !appointment) {
    return (
      <ErrorState
        title="Appointment Not Found"
        message="Could not load the requested appointment record."
      />
    );
  }

  const handleStartConsultation = async () => {
    try {
      await startMutation.mutateAsync({
        appointmentId,
        chiefComplaint: form.getValues("chiefComplaint") || appointment.reason,
      });
    } catch {
      // handled by mutation
    }
  };

  const handleSaveDraft = async () => {
    const values = form.getValues();
    await updateMutation.mutateAsync(values);
  };

  const handleCompleteConfirm = async () => {
    const diagnosis = form.getValues("diagnosis");
    if (!diagnosis || !diagnosis.trim()) {
      notify.error("Please enter a diagnosis before completing the consultation.");
      setCompleteOpen(false);
      return;
    }
    const treatmentPlan = form.getValues("treatmentPlan");
    await completeMutation.mutateAsync({ diagnosis, treatmentPlan });
    setCompleteOpen(false);
  };

  const statusKey = isCompleted
    ? "COMPLETED"
    : consultation
    ? "IN_PROGRESS"
    : "PENDING";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Clinical Consultation"
          description={`Scheduled: ${formatDateTime(appointment.scheduledAt)} • ${appointment.type}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Appointments", href: "/appointments" },
            { label: "Consultation" },
          ]}
        />
        <div className="flex items-center gap-2">
          <StatusBadge status={statusKey} statusMap={CONSULTATION_STATUS_MAP} />
          {isCompleted && (
            <Link href={`/prescriptions?newFor=${consultation?.id}`}>
              <Button size="sm" variant="default" className="gap-1.5">
                <FilePlus className="h-4 w-4" />
                <span>Create Prescription</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Summary & Meeting Panel */}
        <div className="space-y-6 lg:col-span-1">
          {patient ? (
            <ConsultationPatientSidebar patient={patient} />
          ) : (
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="font-semibold text-foreground text-sm">{appointment.patientName}</h3>
              <p className="font-mono text-xs text-muted-foreground">{appointment.patientNo}</p>
            </div>
          )}

          <MeetingPanel
            scheduledAt={appointment.scheduledAt}
            meetingUrl={appointment.meetingUrl}
          />
        </div>

        {/* Right Column: Consultation Workflow & Notes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Action Banner for Start / In-Progress */}
          {!consultation ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-4">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-semibold text-foreground">Ready to start consultation?</h3>
                <p className="text-xs text-muted-foreground">
                  Starting the consultation creates the medical record and logs your clinical start time.
                </p>
              </div>
              {isClinicianOrAdmin ? (
                <Button
                  onClick={handleStartConsultation}
                  disabled={startMutation.isPending || appointment.status !== "CONFIRMED"}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  <span>{startMutation.isPending ? "Starting…" : "Start Consultation"}</span>
                </Button>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  Waiting for assigned clinician to begin the session.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {isCompleted && (
                <div className="rounded-xl border bg-muted/40 p-3.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Lock className="h-3.5 w-3.5 text-emerald-600" />
                    Consultation completed and locked as read-only.
                  </span>
                  <span>Ended: {formatDateTime(consultation.endedAt!)}</span>
                </div>
              )}

              {/* Vitals & Notes Forms */}
              <VitalsForm form={form} isReadOnly={isReadOnly} />
              <ConsultationNotesForm form={form} isReadOnly={isReadOnly} />

              {/* Bottom Clinician Actions */}
              {!isReadOnly && (
                <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border bg-card p-4 shadow-sm">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={updateMutation.isPending}
                    className="gap-1.5"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateMutation.isPending ? "Saving…" : "Save Draft"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setCompleteOpen(true)}
                    disabled={completeMutation.isPending}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Complete Consultation</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completion Confirmation Dialog */}
      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Complete Clinical Consultation?"
        description="This will lock the consultation notes and mark the appointment as COMPLETED. Ensure your diagnosis and patient instructions are finalized."
        confirmLabel="Finalize & Complete"
        variant="default"
        onConfirm={handleCompleteConfirm}
        isLoading={completeMutation.isPending}
      />
    </div>
  );
}
