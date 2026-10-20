"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/shared/components/layout/StatCard";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/components/feedback/StatusBadge";
import { Calendar, Clock, AlertTriangle, Users, ArrowRight, Video } from "lucide-react";
import { APPOINTMENT_STATUS_MAP } from "@/features/appointments/constants/appointment.constants";
import { STOCK_STATUS_MAP } from "@/features/medicines/constants/medicine.constants";
import { ROUTES } from "@/shared/constants/routes";
import type { AdminStaffDashboardData } from "../types/dashboard.types";

interface AdminStaffDashboardProps {
  data: AdminStaffDashboardData;
}

export function AdminStaffDashboard({ data }: AdminStaffDashboardProps) {
  const { stats, todayAppointments, pendingAppointments, lowStockMedicines } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Today's Schedule" value={stats.todayAppointmentsCount} icon={<Calendar className="h-4 w-4 text-blue-600" />} description="Scheduled today" />
        <StatCard title="Pending Requests" value={stats.pendingAppointmentsCount} icon={<Clock className="h-4 w-4 text-amber-600" />} description="Awaiting confirmation" />
        <StatCard title="Low Stock Items" value={stats.lowStockCount} icon={<AlertTriangle className="h-4 w-4 text-rose-600" />} description="At or below reorder" />
        <StatCard title="Expiring Soon" value={stats.expiringCount} icon={<Clock className="h-4 w-4 text-orange-600" />} description="Next 60 days" />
        <StatCard title="Total Patients" value={stats.totalPatientsCount} icon={<Users className="h-4 w-4 text-emerald-600" />} description="Active registered" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Today&apos;s Appointments ({todayAppointments.length})</CardTitle>
            <Link href={ROUTES.APPOINTMENTS}><Button variant="ghost" size="sm" className="h-8 text-xs">View All <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No appointments scheduled for today.</p>
            ) : (
              <div className="divide-y text-sm">
                {todayAppointments.map((appt) => (
                  <div key={appt.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{appt.patient?.firstName} {appt.patient?.lastName} <span className="text-xs text-muted-foreground">({appt.patient?.patientNo})</span></p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Dr. {appt.clinician?.fullName}
                        {appt.type === "ONLINE" && <span className="inline-flex items-center text-blue-600"><Video className="h-3 w-3 ml-1" /> Online</span>}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} statusMap={APPOINTMENT_STATUS_MAP} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Pending Confirmations ({pendingAppointments.length})</CardTitle>
              <Link href={ROUTES.APPOINTMENTS}><Button variant="ghost" size="sm" className="h-8 text-xs">Manage <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
            </CardHeader>
            <CardContent>
              {pendingAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending appointment requests.</p>
              ) : (
                <div className="divide-y text-sm">
                  {pendingAppointments.map((appt) => (
                    <div key={appt.id} className="py-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{appt.patient?.firstName} {appt.patient?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(appt.scheduledAt).toLocaleDateString()} • {appt.reason}</p>
                      </div>
                      <Link href={ROUTES.APPOINTMENTS}><Button size="sm" variant="outline" className="h-7 text-xs">Review</Button></Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Inventory Alerts ({lowStockMedicines.length})</CardTitle>
              <Link href={ROUTES.MEDICINES}><Button variant="ghost" size="sm" className="h-8 text-xs">Inventory <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
            </CardHeader>
            <CardContent>
              {lowStockMedicines.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">All inventory levels are sufficient.</p>
              ) : (
                <div className="divide-y text-sm">
                  {lowStockMedicines.map((med) => (
                    <div key={med.id} className="py-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{med.name} {med.strength}</p>
                        <p className="text-xs text-muted-foreground">On hand: <span className="text-rose-600 font-semibold">{med.totalStock} {med.unit}</span> (Min: {med.reorderLevel})</p>
                      </div>
                      <StatusBadge status={med.stockStatus} statusMap={STOCK_STATUS_MAP} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
