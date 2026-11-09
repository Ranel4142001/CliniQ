"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/layout/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { BANNER_BUTTON, WelcomeBanner } from "@/features/dashboard/components/WelcomeBanner";
import {
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  Video,
  Plus,
  MessageCircle,
} from "lucide-react";
import { APPOINTMENT_STATUS_MAP } from "@/features/appointments/constants/appointment-status.constants";
import { PRESCRIPTION_STATUS_MAP } from "@backend/contracts";
import { ROUTES } from "@/constants/routes";
import type { PatientDashboardData } from "@backend/contracts";

interface PatientDashboardProps {
  data: PatientDashboardData;
  userName?: string | null;
}

function patientSummary(upcoming: number): string {
  if (upcoming === 0) return "You have no upcoming visits. Book one whenever you need care.";
  return `You have ${upcoming} upcoming visit${upcoming === 1 ? "" : "s"}. We'll see you soon.`;
}

export function PatientDashboard({ data, userName }: PatientDashboardProps) {
  const { stats, upcomingAppointments, recentPrescriptions } = data;

  return (
    <div className="space-y-6">
      <WelcomeBanner
        fullName={userName}
        summary={patientSummary(stats.upcomingAppointmentsCount)}
        actions={
          <>
            <Link href={ROUTES.APPOINTMENTS} className={BANNER_BUTTON.primary}>
              <Plus className="h-4 w-4" /> Book appointment
            </Link>
            <Link href={ROUTES.MESSAGES} className={BANNER_BUTTON.secondary}>
              <MessageCircle className="h-4 w-4" /> Message the clinic
            </Link>
          </>
        }
      />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-3" aria-label="Your health at a glance">
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingAppointmentsCount}
          icon={<Calendar className="h-5 w-5" />}
          tone="blue"
          description="Confirmed and pending visits"
        />
        <StatCard
          title="Active Prescriptions"
          value={stats.activePrescriptionsCount}
          icon={<FileText className="h-5 w-5" />}
          tone="teal"
          description="Issued or ready to dispense"
        />
        <StatCard
          title="Completed Visits"
          value={stats.totalConsultationsCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="violet"
          description="Past clinical consultations"
        />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-none">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 pb-3">
            <div>
              <CardTitle className="text-base font-semibold">My Appointments</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Your schedule with our clinic</p>
            </div>
            <Link href={ROUTES.APPOINTMENTS}>
              <Button size="sm" variant="outline" className="shadow-2xs h-8 gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Book New
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {upcomingAppointments.length === 0 ? (
              <div className="space-y-2 py-10 text-center">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">No upcoming visits</p>
                <p className="text-xs text-muted-foreground">
                  Book a consultation whenever you need medical care.
                </p>
                <Button asChild size="sm" className="mt-3">
                  <Link href={ROUTES.APPOINTMENTS}>Book Now</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/60 text-sm">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/20"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {new Date(appt.scheduledAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(appt.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        Dr. {appt.clinician?.fullName || "Attending Clinician"} • {appt.reason}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={appt.status} statusMap={APPOINTMENT_STATUS_MAP} />
                      {appt.type === "ONLINE" && appt.meetingUrl && (
                        <a href={appt.meetingUrl} target="_blank" rel="noopener noreferrer">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-xs text-blue-600"
                          >
                            <Video className="h-3 w-3" /> Join
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-none">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 pb-3">
            <div>
              <CardTitle className="text-base font-semibold">My Prescriptions</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Recent medications prescribed by doctors
              </p>
            </div>
            <Link href={ROUTES.PRESCRIPTIONS}>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {recentPrescriptions.length === 0 ? (
              <div className="space-y-2 py-10 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">No prescriptions yet</p>
                <p className="text-xs text-muted-foreground">
                  Digital prescriptions issued after consultations will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60 text-sm">
                {recentPrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/20"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {rx.prescriptionNo || "Pending Prescription"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {rx.issuedAt
                          ? new Date(rx.issuedAt).toLocaleDateString()
                          : new Date(rx.createdAt).toLocaleDateString()}{" "}
                        • Dr. {rx.clinician?.fullName} • {rx.itemsCount} medicine(s)
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={rx.status} statusMap={PRESCRIPTION_STATUS_MAP} />
                      <Link href={ROUTES.PRESCRIPTIONS}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
