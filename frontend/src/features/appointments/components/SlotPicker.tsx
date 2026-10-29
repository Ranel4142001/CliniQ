"use client";

import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useAvailableSlots } from "@/features/appointments/hooks/useAvailableSlots";

interface SlotPickerProps {
  clinicianId?: string;
  selectedSlot?: string;
  onSelectSlot: (slotIso: string) => void;
  disabled?: boolean;
}

export function SlotPicker({
  clinicianId,
  selectedSlot,
  onSelectSlot,
  disabled,
}: SlotPickerProps) {
  // Default to tomorrow
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return format(addDays(new Date(), 1), "yyyy-MM-dd");
  });

  const { data: slots = [], isLoading, error } = useAvailableSlots(
    clinicianId,
    selectedDate
  );

  // Clear selection if date changes and selected slot is not in current day
  useEffect(() => {
    if (selectedSlot && !selectedSlot.startsWith(selectedDate)) {
      onSelectSlot("");
    }
  }, [selectedDate, selectedSlot, onSelectSlot]);

  const minDate = format(new Date(), "yyyy-MM-dd");
  const maxDate = format(addDays(new Date(), 60), "yyyy-MM-dd");

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <Label htmlFor="slot-date" className="text-sm font-semibold text-foreground">
            Appointment Date
          </Label>
          <p className="text-xs text-muted-foreground">Monday to Friday (08:00 AM - 05:00 PM)</p>
        </div>
        <Input
          id="slot-date"
          type="date"
          value={selectedDate}
          min={minDate}
          max={maxDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          disabled={disabled}
          className="w-full sm:w-48 text-sm"
        />
      </div>

      {!clinicianId ? (
        <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground border rounded-md bg-muted/40">
          <AlertCircle className="h-4 w-4 text-primary shrink-0" />
          Please select a clinician above to view available time slots.
        </div>
      ) : isLoading ? (
        <div className="py-6">
          <LoadingState message="Checking clinician schedule..." />
        </div>
      ) : error ? (
        <p className="text-xs text-destructive">Failed to load time slots. Please try another date.</p>
      ) : slots.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
          No available slots on this day. The clinic is closed on weekends.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Select a 30-minute consultation slot:</span>
            <span className="flex items-center gap-1.5 font-mono">
              <Clock className="h-3 w-3" /> Asia/Manila Time
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot.start;
              return (
                <Button
                  key={slot.start}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={disabled || !slot.isAvailable}
                  onClick={() => onSelectSlot(slot.start)}
                  className={`text-xs h-9 justify-center ${
                    !slot.isAvailable
                      ? "opacity-40 cursor-not-allowed bg-muted line-through"
                      : isSelected
                      ? "ring-2 ring-primary ring-offset-1"
                      : ""
                  }`}
                  title={slot.reason || slot.timeLabel}
                >
                  {slot.timeLabel.split(" - ")[0]}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
