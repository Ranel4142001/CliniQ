"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { TextareaField } from "@/shared/components/form/TextareaField";
import { SelectField } from "@/shared/components/form/SelectField";
import { PatientSelect } from "@/features/patients/components/PatientSelect";
import { ClinicianSelect } from "./ClinicianSelect";
import { SlotPicker } from "./SlotPicker";
import { bookAppointmentSchema, BookAppointmentInput } from "../schemas/appointment.schema";
import type { Role } from "@prisma/client";

interface BookAppointmentFormProps {
  userRole?: Role;
  onSubmit: (data: BookAppointmentInput) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const TYPE_OPTIONS = [
  { value: "IN_PERSON", label: "In-Person Consultation (At Clinic)" },
  { value: "ONLINE", label: "Online Consultation (Google Meet)" },
];

export function BookAppointmentForm({
  userRole,
  onSubmit,
  onCancel,
  isSubmitting,
}: BookAppointmentFormProps) {
  const isPatient = userRole === "PATIENT";

  const methods = useForm<BookAppointmentInput>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: {
      type: "IN_PERSON",
      reason: "",
    },
  });

  const [patientId, setPatientId] = useState<string>("");
  const [clinicianId, setClinicianId] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>("");

  const handleSelectClinician = (val: string) => {
    setClinicianId(val);
    methods.setValue("clinicianId", val, { shouldValidate: true });
  };

  const handleSelectPatient = (val: string) => {
    setPatientId(val);
    methods.setValue("patientId", val, { shouldValidate: true });
  };

  const handleSelectSlot = (slotIso: string) => {
    setScheduledAt(slotIso);
    methods.setValue("scheduledAt", slotIso, { shouldValidate: true });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {!isPatient && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Patient <span className="text-destructive">*</span>
            </Label>
            <PatientSelect
              value={patientId}
              onChange={handleSelectPatient}
              disabled={isSubmitting}
            />
            {methods.formState.errors.patientId && (
              <p className="text-xs text-destructive">
                {methods.formState.errors.patientId.message}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Attending Clinician <span className="text-destructive">*</span>
            </Label>
            <ClinicianSelect
              value={clinicianId}
              onChange={handleSelectClinician}
              disabled={isSubmitting}
            />
            {methods.formState.errors.clinicianId && (
              <p className="text-xs text-destructive">
                {methods.formState.errors.clinicianId.message}
              </p>
            )}
          </div>

          <SelectField
            name="type"
            label="Consultation Mode"
            options={TYPE_OPTIONS}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Schedule Slot <span className="text-destructive">*</span>
          </Label>
          <SlotPicker
            clinicianId={clinicianId}
            selectedSlot={scheduledAt}
            onSelectSlot={handleSelectSlot}
            disabled={isSubmitting}
          />
          {methods.formState.errors.scheduledAt && (
            <p className="text-xs text-destructive">
              {methods.formState.errors.scheduledAt.message}
            </p>
          )}
        </div>

        <TextareaField
          name="reason"
          label="Reason for Visit / Chief Complaint"
          placeholder="Describe your symptoms, concern, or reason for this appointment..."
          rows={3}
          required
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Booking Appointment..." : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
