"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/shared/components/layout/StatCard";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { Calendar, FileText, CheckCircle2, ArrowRight, Video, Plus } from "lucide-react";
import { APPOINTMENT_STATUS_MAP } from "@/features/appointments/constants/appointment.constants";
import { PRESCRIPTION_STATUS_MAP } from "@/features/prescriptions/constants/prescription.constants";
import { ROUTES } from "@/shared/constants/routes";
import type { PatientDashboardData } from "../types/dashboard.types";

interface PatientDashboardProps {
  data: PatientDashboardData;
}

export function PatientDashboard({ data }: PatientDashboardProps) {
  const { stats, upcomingAppointments, recentPrescriptions } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Upcoming Appointments" value={stats.upcomingAppointmentsCount} icon={<Calendar className="h-4 w-4 text-blue-600" />} description="Scheduled visits" />
        <StatCard title="Active Prescriptions" value={stats.activePrescriptionsCount} icon={<FileText className="h-4 w-4 text-emerald-600" />} description="Ready / Issued" />
        <StatCard title="Completed Consultations" value={stats.totalConsultationsCount} icon={<CheckCircle2 className="h-4 w-4 text-purple-600" />} description="Past medical history" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">My Upcoming Appointments</CardTitle>
            <Link href={ROUTES.APPOINTMENTS}><Button size="sm" variant="outline" className="h-8 text-xs"><Plus className="mr-1 h-3.5 w-3.5" /> Book New</Button></Link>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <p>You have no upcoming appointments scheduled.</p>
                <Link href={ROUTES.APPOINTMENTS}><Button size="sm" className="mt-3">Book an Appointment</Button></Link>
              </div>
            ) : (
              <div className="divide-y text-sm">
                {upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{new Date(appt.scheduledAt).toLocaleDateString()} at {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Dr. {appt.clinician?.fullName || "Attending Doctor"} • {appt.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={appt.status} statusMap={APPOINTMENT_STATUS_MAP} />
                      {appt.type === "ONLINE" && appt.meetingUrl && (
                        <a href={appt.meetingUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="h-7 text-xs text-blue-600">
                            <Video className="h-3 w-3 mr-1" /> Join
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">My Recent Prescriptions</CardTitle>
            <Link href={ROUTES.PRESCRIPTIONS}><Button variant="ghost" size="sm" className="h-8 text-xs">View All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
          </CardHeader>
          <CardContent>
            {recentPrescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No prescriptions found.</p>
            ) : (
              <div className="divide-y text-sm">
                {recentPrescriptions.map((rx) => (
                  <div key={rx.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{rx.prescriptionNo || "Pending Rx"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rx.issuedAt ? new Date(rx.issuedAt).toLocaleDateString() : new Date(rx.createdAt).toLocaleDateString()} • Dr. {rx.clinician?.fullName} • {rx.itemsCount} medicine(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={rx.status} statusMap={PRESCRIPTION_STATUS_MAP} />
                      <Link href={ROUTES.PRESCRIPTIONS}><Button size="sm" variant="ghost" className="h-7 text-xs">View</Button></Link>
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
