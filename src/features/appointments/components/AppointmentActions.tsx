"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, X, CalendarClock, UserX, Video, Stethoscope } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { SlotPicker } from "./SlotPicker";
import type { AppointmentListItem, AppointmentDTO } from "../types/appointment.types";
import type { Role } from "@prisma/client";

interface AppointmentActionsProps {
  appointment: AppointmentListItem | AppointmentDTO;
  userRole?: Role;
  onConfirm: (meetingUrl?: string) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
  onReschedule: (newScheduledAt: string) => Promise<void>;
  onComplete?: () => Promise<void>;
  onNoShow?: () => Promise<void>;
  isUpdating?: boolean;
}

export function AppointmentActions({
  appointment,
  userRole,
  onConfirm,
  onCancel,
  onReschedule,
  onComplete,
  onNoShow,
  isUpdating = false,
}: AppointmentActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState(appointment.meetingUrl || "");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newSlot, setNewSlot] = useState("");

  const isPending = appointment.status === "PENDING";
  const isConfirmed = appointment.status === "CONFIRMED";
  const isStaffOrAdmin = userRole === "ADMIN" || userRole === "STAFF";

  const handleConfirmClick = async () => {
    if (appointment.type === "ONLINE" && !appointment.meetingUrl) {
      setConfirmOpen(true);
    } else {
      await onConfirm(appointment.meetingUrl || undefined);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {isPending && isStaffOrAdmin && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
          onClick={handleConfirmClick}
          disabled={isUpdating}
        >
          <Check className="h-3.5 w-3.5" /> Confirm
        </Button>
      )}

      {(isPending || isConfirmed) && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setRescheduleOpen(true)}
            disabled={isUpdating}
          >
            <CalendarClock className="h-3.5 w-3.5" /> Reschedule
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10"
            onClick={() => setCancelOpen(true)}
            disabled={isUpdating}
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </Button>
        </>
      )}

      {isConfirmed && (
        <Link href={`/consultations/${appointment.id}`}>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 border-primary text-primary hover:bg-primary/10"
          >
            <Stethoscope className="h-3.5 w-3.5" /> Consult
          </Button>
        </Link>
      )}

      {isConfirmed && onComplete && (userRole === "CLINICIAN" || isStaffOrAdmin) && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
          onClick={onComplete}
          disabled={isUpdating}
        >
          <Check className="h-3.5 w-3.5" /> Complete
        </Button>
      )}

      {isConfirmed && isStaffOrAdmin && onNoShow && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-destructive"
          onClick={onNoShow}
          disabled={isUpdating}
        >
          <UserX className="h-3.5 w-3.5" /> No-Show
        </Button>
      )}

      {/* Online Confirm Dialog (Google Meet link entry) */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" /> Confirm Online Consultation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="meet-link" className="text-xs font-medium">
              Google Meet URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="meet-link"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Please paste the generated Google Meet link. Patients will use this link to join.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!meetingUrl.trim() || isUpdating}
              onClick={async () => {
                await onConfirm(meetingUrl);
                setConfirmOpen(false);
              }}
            >
              Confirm Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="cancel-reason" className="text-xs font-medium">
              Reason for Cancellation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide the reason for cancelling this appointment..."
              rows={3}
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCancelOpen(false)}>Close</Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!cancelReason.trim() || isUpdating}
              onClick={async () => {
                await onCancel(cancelReason);
                setCancelOpen(false);
              }}
            >
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <SlotPicker
              clinicianId={appointment.clinicianId}
              selectedSlot={newSlot}
              onSelectSlot={setNewSlot}
              disabled={isUpdating}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!newSlot || isUpdating}
              onClick={async () => {
                await onReschedule(newSlot);
                setRescheduleOpen(false);
              }}
            >
              Save New Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
