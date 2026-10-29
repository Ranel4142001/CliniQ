"use client";

import React, { useState } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { APPOINTMENT_STATUS_MAP } from "@/features/appointments/constants/appointment-status.constants";
import { formatTime } from "@/lib/date";
import type { AppointmentListItem } from "@backend/contracts";

interface AppointmentCalendarProps {
  appointments: AppointmentListItem[];
  onSelectAppointment?: (appointment: AppointmentListItem) => void;
}

export function AppointmentCalendar({
  appointments,
  onSelectAppointment,
}: AppointmentCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    // Monday of current week (weekStartsOn: 1)
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // 5 workdays: Monday to Friday
  const workDays = Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));

  const handlePrevWeek = () => setCurrentWeekStart((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1));
  const handleToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            {format(workDays[0], "MMMM d")} - {format(workDays[4], "MMMM d, yyyy")}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs">
            Current Week
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrevWeek} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {workDays.map((day) => {
          const dayAppointments = appointments.filter((appt) =>
            isSameDay(new Date(appt.scheduledAt), day)
          );
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`flex flex-col rounded-lg border p-2.5 min-h-[260px] ${
                isToday ? "border-primary/50 bg-primary/5" : "border-muted bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                <span className="text-xs font-semibold text-foreground">
                  {format(day, "EEE")}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isToday ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
                  }`}
                >
                  {format(day, "MMM d")}
                </span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {dayAppointments.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground/60 text-center py-6">
                    No bookings
                  </p>
                ) : (
                  dayAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      onClick={() => onSelectAppointment?.(appt)}
                      className="cursor-pointer rounded border bg-card p-2 text-xs shadow-xs hover:border-primary transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-foreground">
                        <span>{formatTime(appt.scheduledAt)}</span>
                        {appt.type === "ONLINE" ? (
                          <Video className="h-3 w-3 text-blue-600 shrink-0" />
                        ) : (
                          <User className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <p className="font-semibold text-foreground truncate">
                        {appt.patientName}
                      </p>
                      <div className="pt-0.5">
                        <StatusBadge
                          status={appt.status}
                          statusMap={APPOINTMENT_STATUS_MAP}
                          className="text-[10px] py-0 px-1.5"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
