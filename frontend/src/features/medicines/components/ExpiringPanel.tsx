"use client";

import React from "react";
import { Clock } from "lucide-react";
import { TonePill } from "@/components/feedback/StatusBadge";
import { SectionCard, SectionEmpty, SectionList } from "@/components/layout/SectionCard";
import type { MedicineBatchWithMedicine } from "@backend/contracts";

interface ExpiringPanelProps {
  expiringSoon: MedicineBatchWithMedicine[];
  expired: MedicineBatchWithMedicine[];
  onStockAdjustment?: (medicineId: string) => void;
}

const DAY_MS = 1000 * 60 * 60 * 24;

function daysLeft(date: Date | string): number {
  return Math.ceil((new Date(date).getTime() - new Date().setHours(0, 0, 0, 0)) / DAY_MS);
}

function BatchRow({ batch, isExpired }: { batch: MedicineBatchWithMedicine; isExpired: boolean }) {
  const expiry = new Date(batch.expiryDate).toLocaleDateString();
  const days = daysLeft(batch.expiryDate);
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-foreground">
          {batch.medicine.name}{" "}
          <span className="text-[13px] font-normal text-muted-foreground">
            {batch.medicine.strength} · Batch {batch.batchNo}
          </span>
        </p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {isExpired ? (
            <span className="font-semibold text-rose-600 dark:text-rose-400">Expired {expiry}</span>
          ) : (
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              Expires {expiry} · {days} day{days === 1 ? "" : "s"} left
            </span>
          )}{" "}
          · {batch.quantity} {batch.medicine.unit}
        </p>
      </div>
      <TonePill
        tone={isExpired ? "red" : "amber"}
        label={isExpired ? "Expired" : "Expiring soon"}
      />
    </li>
  );
}

export function ExpiringPanel({ expiringSoon, expired }: ExpiringPanelProps) {
  const total = expiringSoon.length + expired.length;

  return (
    <SectionCard
      title="Expiry alerts"
      subtitle="Expired or expiring within 60 days"
      icon={<Clock className="h-5 w-5" />}
      tone="red"
      count={total}
    >
      {total === 0 ? (
        <SectionEmpty>All batches have a healthy shelf life.</SectionEmpty>
      ) : (
        <SectionList>
          {expired.map((batch) => (
            <BatchRow key={batch.id} batch={batch} isExpired />
          ))}
          {expiringSoon.map((batch) => (
            <BatchRow key={batch.id} batch={batch} isExpired={false} />
          ))}
        </SectionList>
      )}
    </SectionCard>
  );
}
