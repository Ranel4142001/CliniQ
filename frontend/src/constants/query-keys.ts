export const QUERY_KEYS = {
  CURRENT_USER: ["currentUser"] as const,
  PATIENTS: {
    all: ["patients"] as const,
    list: (params?: unknown) => ["patients", "list", params] as const,
    detail: (id: string) => ["patients", "detail", id] as const,
  },
  APPOINTMENTS: {
    all: ["appointments"] as const,
    list: (params?: unknown) => ["appointments", "list", params] as const,
    detail: (id: string) => ["appointments", "detail", id] as const,
    slots: (clinicianId: string, date: string) =>
      ["appointments", "slots", clinicianId, date] as const,
  },
  CONSULTATIONS: {
    all: ["consultations"] as const,
    detail: (appointmentId: string) => ["consultations", "detail", appointmentId] as const,
    chat: (appointmentId: string) => ["consultations", "chat", appointmentId] as const,
  },
  MEDICINES: {
    all: ["medicines"] as const,
    list: (params?: unknown) => ["medicines", "list", params] as const,
    detail: (id: string) => ["medicines", "detail", id] as const,
    movements: (medicineId: string) => ["medicines", "movements", medicineId] as const,
  },
  PRESCRIPTIONS: {
    all: ["prescriptions"] as const,
    list: (params?: unknown) => ["prescriptions", "list", params] as const,
    detail: (id: string) => ["prescriptions", "detail", id] as const,
  },
  REPORTS: {
    summary: (range?: string) => ["reports", "summary", range] as const,
    appointments: (params?: unknown) => ["reports", "appointments", params] as const,
    medicines: (params?: unknown) => ["reports", "medicines", params] as const,
  },
  USERS: {
    all: ["users"] as const,
    list: (params?: unknown) => ["users", "list", params] as const,
  },
} as const;
