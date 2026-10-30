"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/layout/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import {
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  Video,
  Plus,
  HeartPulse,
} from "lucide-react";
import { APPOINTMENT_STATUS_MAP } from "@/features/appointments/constants/appointment-status.constants";
import { PRESCRIPTION_STATUS_MAP } from "@backend/contracts";
import { ROUTES } from "@/constants/routes";
import type { PatientDashboardData } from "@backend/contracts";

interface PatientDashboardProps {
  data: PatientDashboardData;
}

export function PatientDashboard({ data }: PatientDashboardProps) {
  const { stats, upcomingAppointments, recentPrescriptions } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Patient Health Portal
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your clinic appointments, consultations, and digital prescriptions.
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="gap-1.5 shadow-sm">
          <Link href={ROUTES.APPOINTMENTS}>
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </Link>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingAppointmentsCount}
          icon={<Calendar className="h-4 w-4 text-blue-600" />}
          description="Confirmed and pending visits"
        />
        <StatCard
          title="Active Prescriptions"
          value={stats.activePrescriptionsCount}
          icon={<FileText className="h-4 w-4 text-emerald-600" />}
          description="Issued or ready to dispense"
        />
        <StatCard
          title="Completed Visits"
          value={stats.totalConsultationsCount}
          icon={<CheckCircle2 className="h-4 w-4 text-purple-600" />}
          description="Past clinical consultations"
        />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="rounded-xl border border-border/80 shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-3 bg-muted/20 border-b border-border/60">
            <div>
              <CardTitle className="text-base font-semibold">My Appointments</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Your schedule with our clinic</p>
            </div>
            <Link href={ROUTES.APPOINTMENTS}>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1 shadow-2xs">
                <Plus className="h-3.5 w-3.5" /> Book New
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {upcomingAppointments.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">No upcoming visits</p>
                <p className="text-xs text-muted-foreground">Book a consultation whenever you need medical care.</p>
                <Button asChild size="sm" className="mt-3">
                  <Link href={ROUTES.APPOINTMENTS}>Book Now</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/60 text-sm">
                {upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="py-3 flex items-center justify-between gap-3 hover:bg-muted/20 px-2 rounded-lg transition-colors">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {new Date(appt.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at{" "}
                        {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        Dr. {appt.clinician?.fullName || "Attending Clinician"} • {appt.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={appt.status} statusMap={APPOINTMENT_STATUS_MAP} />
                      {appt.type === "ONLINE" && appt.meetingUrl && (
                        <a href={appt.meetingUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="h-7 text-xs text-blue-600 gap-1">
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
        <Card className="rounded-xl border border-border/80 shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-3 bg-muted/20 border-b border-border/60">
            <div>
              <CardTitle className="text-base font-semibold">My Prescriptions</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Recent medications prescribed by doctors</p>
            </div>
            <Link href={ROUTES.PRESCRIPTIONS}>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {recentPrescriptions.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">No prescriptions yet</p>
                <p className="text-xs text-muted-foreground">Digital prescriptions issued after consultations will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60 text-sm">
                {recentPrescriptions.map((rx) => (
                  <div key={rx.id} className="py-3 flex items-center justify-between gap-3 hover:bg-muted/20 px-2 rounded-lg transition-colors">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {rx.prescriptionNo || "Pending Prescription"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {rx.issuedAt ? new Date(rx.issuedAt).toLocaleDateString() : new Date(rx.createdAt).toLocaleDateString()} • Dr. {rx.clinician?.fullName} • {rx.itemsCount} medicine(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
