export interface TimeInterval {
  scheduledAt: Date | string;
  endsAt: Date | string;
  id?: string;
  status?: string;
}

/**
 * Checks if a proposed appointment time interval overlaps with any existing appointments.
 * Intervals [start, end) overlap if: startA < endB AND startB < endA.
 * Cancelled appointments do not cause conflicts.
 */
export function hasConflict(
  newStart: Date | string,
  newEnd: Date | string,
  existingAppointments: TimeInterval[],
  excludeAppointmentId?: string
): boolean {
  const start = new Date(newStart).getTime();
  const end = new Date(newEnd).getTime();

  if (start >= end) {
    throw new Error("Invalid interval: start time must be before end time");
  }

  return existingAppointments.some((appt) => {
    if (excludeAppointmentId && appt.id === excludeAppointmentId) {
      return false;
    }

    if (appt.status === "CANCELLED") {
      return false;
    }

    const apptStart = new Date(appt.scheduledAt).getTime();
    const apptEnd = new Date(appt.endsAt).getTime();

    return start < apptEnd && apptStart < end;
  });
}
