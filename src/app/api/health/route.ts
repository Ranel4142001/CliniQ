import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { isDemoMode } from "@/shared/lib/supabase/demo-mode";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "healthy";
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch {
    dbStatus = isDemoMode() ? "simulated-in-memory" : "degraded";
  }

  const uptimeSeconds = Math.floor(process.uptime());
  const memoryUsage = process.memoryUsage();

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      environment: process.env.NODE_ENV || "development",
      demoMode: isDemoMode(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
      responseTimeMs: Date.now() - startTime,
    },
    { status: 200 }
  );
}
