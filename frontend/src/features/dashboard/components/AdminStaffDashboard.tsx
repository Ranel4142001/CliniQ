"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/layout/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  Video,
  UserPlus,
  PlusCircle,
  BarChart3,
  Pill,
} from "lucide-react";
import { APPOINTMENT_STATUS_MAP } from "@/features/appointments/constants/appointment-status.constants";
import { STOCK_STATUS_MAP } from "@backend/contracts";
import { ROUTES } from "@/constants/routes";
import type { AdminStaffDashboardData } from "@backend/contracts";

interface AdminStaffDashboardProps {
  data: AdminStaffDashboardData;
}

export function AdminStaffDashboard({ data }: AdminStaffDashboardProps) {
  const { stats, todayAppointments, pendingAppointments, lowStockMedicines } = data;

  return (
    <div className="space-y-6">
      {/* Quick Action Shortcuts */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl border border-border/80 bg-muted/20">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
          Quick Actions:
        </span>
        <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5 shadow-2xs">
          <Link href={ROUTES.PATIENTS}>
            <UserPlus className="h-3.5 w-3.5 text-primary" />
            <span>Register Patient</span>
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5 shadow-2xs">
          <Link href={ROUTES.APPOINTMENTS}>
            <PlusCircle className="h-3.5 w-3.5 text-blue-600" />
            <span>Book Appointment</span>
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5 shadow-2xs">
          <Link href={ROUTES.MEDICINES}>
            <Pill className="h-3.5 w-3.5 text-amber-600" />
            <span>Manage Stock</span>
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5 shadow-2xs">
          <Link href={ROUTES.REPORTS}>
            <BarChart3 className="h-3.5 w-3.5 text-purple-600" />
            <span>View Reports</span>
          </Link>
        </Button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Today's Schedule"
          value={stats.todayAppointmentsCount}
          icon={<Calendar className="h-4 w-4 text-blue-600" />}
          description="Scheduled visits today"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingAppointmentsCount}
          icon={<Clock className="h-4 w-4 text-amber-600" />}
          description="Awaiting confirmation"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={<AlertTriangle className="h-4 w-4 text-rose-600" />}
          description="At or below reorder"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringCount}
          icon={<Clock className="h-4 w-4 text-orange-600" />}
          description="Next 60 days batch expiry"
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatientsCount}
          icon={<Users className="h-4 w-4 text-emerald-600" />}
          description="Active registered records"
        />
      </div>

      {/* Main Operational Grids */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <Card className="rounded-xl border border-border/80 shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/60">
            <div>
              <CardTitle className="text-base font-semibold">Today&apos;s Appointments</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{todayAppointments.length} patient(s) queued for today</p>
            </div>
            <Link href={ROUTES.APPOINTMENTS}>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {todayAppointments.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">No appointments today</p>
                <p className="text-xs text-muted-foreground">New bookings will appear here automatically.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60 text-sm">
                {todayAppointments.map((appt) => (
                  <div key={appt.id} className="py-3 flex items-center justify-between gap-3 hover:bg-muted/20 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-xs text-primary">
                        {(appt.patient?.firstName?.[0] || "P") + (appt.patient?.lastName?.[0] || "")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {appt.patient?.firstName} {appt.patient?.lastName}{" "}
                          <span className="text-[11px] font-mono text-muted-foreground font-normal">
                            ({appt.patient?.patientNo})
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-foreground">
                            {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span>•</span>
                          <span className="truncate">Dr. {appt.clinician?.fullName}</span>
                          {appt.type === "ONLINE" && (
                            <span className="inline-flex items-center text-blue-600 font-medium">
                              <Video className="h-3 w-3 mr-0.5" /> Teleconsult
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={appt.status} statusMap={APPOINTMENT_STATUS_MAP} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Pending Confirmations & Inventory Alerts */}
        <div className="space-y-6">
          {/* Pending Confirmations */}
          <Card className="rounded-xl border border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/60">
              <div>
                <CardTitle className="text-base font-semibold">Pending Confirmations</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Requires front desk or clinician review</p>
              </div>
              <Link href={ROUTES.APPOINTMENTS}>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              {pendingAppointments.length === 0 ? (
                <div className="py-6 text-center space-y-1">
                  <Clock className="h-6 w-6 mx-auto text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">All appointments are confirmed.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60 text-sm">
                  {pendingAppointments.map((appt) => (
                    <div key={appt.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-muted/20 px-2 rounded-lg transition-colors">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {appt.patient?.firstName} {appt.patient?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {new Date(appt.scheduledAt).toLocaleDateString()} at{" "}
                          {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                          {appt.reason}
                        </p>
                      </div>
                      <Link href={ROUTES.APPOINTMENTS}>
                        <Button size="sm" variant="outline" className="h-7 text-xs shadow-2xs font-medium">
                          Review
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="rounded-xl border border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/60">
              <div>
                <CardTitle className="text-base font-semibold">Inventory Alerts</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Medicines near or below threshold</p>
              </div>
              <Link href={ROUTES.MEDICINES}>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                  Inventory <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              {lowStockMedicines.length === 0 ? (
                <div className="py-6 text-center space-y-1">
                  <Pill className="h-6 w-6 mx-auto text-emerald-500/40" />
                  <p className="text-sm text-muted-foreground">All inventory levels are sufficient.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60 text-sm">
                  {lowStockMedicines.map((med) => (
                    <div key={med.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-muted/20 px-2 rounded-lg transition-colors">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {med.name} <span className="font-normal text-xs text-muted-foreground">({med.strength})</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          On hand:{" "}
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {med.totalStock} {med.unit}
                          </span>{" "}
                          <span className="text-[11px] text-muted-foreground/80">(Reorder min: {med.reorderLevel})</span>
                        </p>
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
