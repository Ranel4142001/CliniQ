import type { Role, Sex, AppointmentType, AppointmentStatus, PrescriptionStatus, StockMovementType } from "@prisma/client";

export interface DemoClinician {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface DemoPatient {
  id: string;
  patientNo: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  birthDate: Date;
  sex: Sex;
  contactNumber: string;
  address: string;
  guardianName: string | null;
  guardianContact: string | null;
  emergencyName: string;
  emergencyContact: string;
  bloodType: string | null;
  allergies: string | null;
  existingConditions: string | null;
  consentGivenAt: Date;
  isArchived: boolean;
  profileId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoMedicineBatch {
  id: string;
  medicineId: string;
  batchNo: string;
  expiryDate: Date;
  quantity: number;
  createdAt: Date;
}

export interface DemoMedicine {
  id: string;
  name: string;
  genericName: string | null;
  dosageForm: string;
  strength: string;
  unit: string;
  reorderLevel: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  batches: DemoMedicineBatch[];
}

export interface DemoAppointment {
  id: string;
  patientId: string;
  clinicianId: string;
  scheduledAt: Date;
  endsAt: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  meetingUrl: string | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient: {
    id: string;
    patientNo: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    contactNumber: string;
    profileId?: string | null;
  };
  clinician: {
    id: string;
    fullName: string;
    email: string;
  };
  consultation: {
    id: string;
    chiefComplaint?: string;
    diagnosis?: string | null;
    startedAt?: Date | null;
    endedAt?: Date | null;
  } | null;
}

export interface DemoPrescription {
  id: string;
  prescriptionNo: string | null;
  consultationId: string;
  patientId: string;
  clinicianId: string;
  status: PrescriptionStatus;
  notes: string | null;
  voidReason: string | null;
  issuedAt: Date | null;
  dispensedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  patient: DemoPatient;
  clinician: { id: string; fullName: string; email: string };
  consultation: {
    id: string;
    chiefComplaint: string;
    startedAt: Date | null;
    endedAt: Date | null;
    diagnosis: string | null;
    treatmentPlan: string | null;
  };
  items: Array<{
    id: string;
    prescriptionId: string;
    medicineId: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    quantity: number;
    instructions: string | null;
    medicine: DemoMedicine;
  }>;
  stockMovements: Array<{
    id: string;
    medicineId: string;
    batchId: string;
    type: StockMovementType;
    quantity: number;
    reason: string | null;
    createdAt: Date;
  }>;
}

// 1. Clinicians
export const DEMO_CLINICIANS: DemoClinician[] = [
  { id: "demo-doc-1", fullName: "Dr. Alberto Cruz", email: "dr.cruz@cliniq.local", role: "CLINICIAN" },
  { id: "demo-doc-2", fullName: "Dr. Maria Elena Reyes", email: "dr.reyes@cliniq.local", role: "CLINICIAN" },
];

// 2. Patients (20 Fictional Patients)
const rawPatients = [
  { no: "PT-2026-0001", first: "Juan", last: "Dela Cruz", sex: "MALE" as Sex, bday: "1985-06-12", blood: "O+", cond: "Hypertension", phone: "09171234567" },
  { no: "PT-2026-0002", first: "Maria Clara", last: "Santos", sex: "FEMALE" as Sex, bday: "1992-03-24", blood: "A+", allg: "Penicillin", phone: "09182345678" },
  { no: "PT-2026-0003", first: "Jose", last: "Rizal", sex: "MALE" as Sex, bday: "1990-12-30", blood: "B+", cond: "Asthma", phone: "09193456789" },
  { no: "PT-2026-0004", first: "Gabriela", last: "Silang", sex: "FEMALE" as Sex, bday: "1995-03-19", blood: "AB+", phone: "09204567890" },
  { no: "PT-2026-0005", first: "Andres", last: "Bonifacio", sex: "MALE" as Sex, bday: "1988-11-30", blood: "O+", cond: "Type 2 Diabetes", phone: "09215678901" },
  { no: "PT-2026-0006", first: "Melchora", last: "Aquino", sex: "FEMALE" as Sex, bday: "1970-01-06", blood: "A-", cond: "Osteoarthritis", phone: "09226789012" },
  { no: "PT-2026-0007", first: "Emilio", last: "Aguinaldo", sex: "MALE" as Sex, bday: "1983-03-22", blood: "B-", phone: "09237890123" },
  { no: "PT-2026-0008", first: "Apolinario", last: "Mabini", sex: "MALE" as Sex, bday: "1987-07-23", blood: "AB-", phone: "09248901234" },
  { no: "PT-2026-0009", first: "Marcelo", last: "Del Pilar", sex: "MALE" as Sex, bday: "1986-08-30", blood: "O+", allg: "NSAIDs", phone: "09259012345" },
  { no: "PT-2026-0010", first: "Antonio", last: "Luna", sex: "MALE" as Sex, bday: "1989-10-29", blood: "A+", cond: "Hypertension", phone: "09260123456" },
  { no: "PT-2026-0011", first: "Teresa", last: "Magbanua", sex: "FEMALE" as Sex, bday: "1994-10-13", blood: "B+", phone: "09271234567" },
  { no: "PT-2026-0012", first: "Gregorio", last: "Del Pilar", sex: "MALE" as Sex, bday: "1996-11-14", blood: "O+", phone: "09282345678" },
  { no: "PT-2026-0013", first: "Francisco", last: "Dagohoy", sex: "MALE" as Sex, bday: "1984-05-10", blood: "A+", cond: "Gout", phone: "09293456789" },
  { no: "PT-2026-0014", first: "Lapu", last: "Lapu", sex: "MALE" as Sex, bday: "1982-04-27", blood: "O+", phone: "09304567890" },
  { no: "PT-2026-0015", first: "Corazon", last: "Aquino", sex: "FEMALE" as Sex, bday: "1993-01-25", blood: "A+", phone: "09315678901" },
  { no: "PT-2026-0016", first: "Ramon", last: "Magsaysay", sex: "MALE" as Sex, bday: "1989-08-31", blood: "B+", phone: "09326789012" },
  { no: "PT-2026-0017", first: "Manuel", last: "Quezon", sex: "MALE" as Sex, bday: "1987-08-19", blood: "O+", cond: "Asthma", phone: "09337890123" },
  { no: "PT-2026-0018", first: "Teodora", last: "Alonso", sex: "FEMALE" as Sex, bday: "1975-11-09", blood: "A+", cond: "Type 2 Diabetes", phone: "09348901234" },
  { no: "PT-2026-0019", first: "Carlos", last: "Garcia", sex: "MALE" as Sex, bday: "1991-11-04", blood: "AB+", phone: "09359012345" },
  { no: "PT-2026-0020", first: "Diego", last: "Silang", sex: "MALE" as Sex, bday: "1988-12-16", blood: "O+", phone: "09360123456" },
];

export const DEMO_PATIENTS: DemoPatient[] = rawPatients.map((p, idx) => ({
  id: `demo-pat-${idx + 1}`,
  patientNo: p.no,
  firstName: p.first,
  middleName: null,
  lastName: p.last,
  birthDate: new Date(p.bday),
  sex: p.sex,
  contactNumber: p.phone,
  address: "Metro Manila, Philippines",
  guardianName: null,
  guardianContact: null,
  emergencyName: "Emergency Contact Person",
  emergencyContact: "09170000000",
  bloodType: p.blood,
  allergies: (p as { allg?: string }).allg || null,
  existingConditions: (p as { cond?: string }).cond || null,
  consentGivenAt: new Date(),
  isArchived: false,
  profileId: idx === 0 ? "demo-raneldahil-gmail-com" : null,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// 3. Medicines (30 Items with Batches)
const rawMedicines = [
  { name: "Amoxicillin", gen: "Amoxicillin Trihydrate", form: "Capsule", str: "500mg", unit: "capsule", reorder: 50, batch: "B26-AMX01", qty: 500, days: 450 },
  { name: "Paracetamol", gen: "Acetaminophen", form: "Tablet", str: "500mg", unit: "tablet", reorder: 100, batch: "B26-PCM01", qty: 1000, days: 600 },
  { name: "Ibuprofen", gen: "Ibuprofen", form: "Tablet", str: "400mg", unit: "tablet", reorder: 30, batch: "B26-IBU01", qty: 8, days: 300 }, // Low Stock
  { name: "Cetirizine", gen: "Cetirizine Hydrochloride", form: "Tablet", str: "10mg", unit: "tablet", reorder: 40, batch: "B26-CET01", qty: 350, days: 400 },
  { name: "Metformin", gen: "Metformin Hydrochloride", form: "Tablet", str: "500mg", unit: "tablet", reorder: 50, batch: "B26-MET01", qty: 400, days: 500 },
  { name: "Amlodipine", gen: "Amlodipine Besylate", form: "Tablet", str: "5mg", unit: "tablet", reorder: 40, batch: "B26-AML01", qty: 45, days: 18 }, // Expiring soon (<30 days)
  { name: "Losartan", gen: "Losartan Potassium", form: "Tablet", str: "50mg", unit: "tablet", reorder: 50, batch: "B26-LOS01", qty: 600, days: 550 },
  { name: "Salbutamol", gen: "Salbutamol Sulfate", form: "Syrup", str: "2mg/5mL 60mL", unit: "bottle", reorder: 20, batch: "B26-SAL01", qty: 80, days: 360 },
  { name: "Mefenamic Acid", gen: "Mefenamic Acid", form: "Capsule", str: "500mg", unit: "capsule", reorder: 30, batch: "B26-MEF01", qty: 250, days: 420 },
  { name: "Omeprazole", gen: "Omeprazole", form: "Capsule", str: "20mg", unit: "capsule", reorder: 25, batch: "B26-OME01", qty: 5, days: 320 }, // Low Stock
  { name: "Azithromycin", gen: "Azithromycin Dihydrate", form: "Tablet", str: "500mg", unit: "tablet", reorder: 20, batch: "B26-AZI01", qty: 120, days: 380 },
  { name: "Ciprofloxacin", gen: "Ciprofloxacin HCl", form: "Tablet", str: "500mg", unit: "tablet", reorder: 25, batch: "B26-CIP01", qty: 180, days: 410 },
  { name: "Co-Amoxiclav", gen: "Amoxicillin + Clavulanate", form: "Tablet", str: "625mg", unit: "tablet", reorder: 30, batch: "B26-COA01", qty: 200, days: 300 },
  { name: "Doxycycline", gen: "Doxycycline Hyclate", form: "Capsule", str: "100mg", unit: "capsule", reorder: 20, batch: "B26-DOX01", qty: 150, days: 390 },
  { name: "Oral Rehydration Salts", gen: "ORS Formulation", form: "Powder", str: "20.5g", unit: "sachet", reorder: 50, batch: "B26-ORS01", qty: 500, days: 700 },
  { name: "Ascorbic Acid", gen: "Vitamin C", form: "Tablet", str: "500mg", unit: "tablet", reorder: 80, batch: "B26-VTC01", qty: 850, days: 650 },
  { name: "Multivitamins + Iron", gen: "Daily Multivitamins", form: "Capsule", str: "Standard", unit: "capsule", reorder: 50, batch: "B26-MVI01", qty: 450, days: 500 },
  { name: "Antacid Chewable", gen: "Al(OH)3 + Mg(OH)2", form: "Chewable Tablet", str: "200mg/100mg", unit: "tablet", reorder: 40, batch: "B26-ANT01", qty: 300, days: 480 },
  { name: "Lagundi", gen: "Vitex negundo", form: "Tablet", str: "300mg", unit: "tablet", reorder: 30, batch: "B26-LAG01", qty: 260, days: 365 },
  { name: "Hyoscine-N-Butylbromide", gen: "Hyoscine Butylbromide", form: "Tablet", str: "10mg", unit: "tablet", reorder: 25, batch: "B26-HYO01", qty: 12, days: 400 }, // Low Stock
  { name: "Loratadine", gen: "Loratadine", form: "Tablet", str: "10mg", unit: "tablet", reorder: 20, batch: "B26-LOR01", qty: 220, days: 450 },
  { name: "Gliclazide", gen: "Gliclazide MR", form: "Tablet", str: "80mg", unit: "tablet", reorder: 25, batch: "B26-GLI01", qty: 180, days: 390 },
  { name: "Simvastatin", gen: "Simvastatin", form: "Tablet", str: "20mg", unit: "tablet", reorder: 20, batch: "B25-SIM99", qty: 30, days: -15 }, // Expired
  { name: "Paracetamol Syrup", gen: "Pediatric Paracetamol", form: "Syrup", str: "120mg/5mL 60mL", unit: "bottle", reorder: 20, batch: "B26-PCS01", qty: 95, days: 400 },
  { name: "Betamethasone Cream", gen: "Betamethasone Valerate", form: "Cream", str: "0.1% 15g", unit: "tube", reorder: 15, batch: "B26-BET01", qty: 60, days: 350 },
  { name: "Silver Sulfadiazine", gen: "Silver Sulfadiazine", form: "Cream", str: "1% 20g", unit: "tube", reorder: 10, batch: "B26-SSD01", qty: 40, days: 330 },
  { name: "Povidone-Iodine", gen: "Povidone Iodine", form: "Solution", str: "10% 60mL", unit: "bottle", reorder: 20, batch: "B26-PVI01", qty: 75, days: 600 },
  { name: "Carbocisteine", gen: "Carbocisteine", form: "Capsule", str: "500mg", unit: "capsule", reorder: 30, batch: "B26-CAR01", qty: 320, days: 410 },
  { name: "Cefalexin", gen: "Cefalexin Monohydrate", form: "Capsule", str: "500mg", unit: "capsule", reorder: 25, batch: "B26-CEF01", qty: 210, days: 370 },
  { name: "Tranexamic Acid", gen: "Tranexamic Acid", form: "Capsule", str: "500mg", unit: "capsule", reorder: 20, batch: "B26-TRA01", qty: 6, days: 340 }, // Low Stock
];

export const DEMO_MEDICINES: DemoMedicine[] = rawMedicines.map((m, idx) => {
  const medId = `demo-med-${idx + 1}`;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + m.days);

  return {
    id: medId,
    name: m.name,
    genericName: m.gen,
    dosageForm: m.form,
    strength: m.str,
    unit: m.unit,
    reorderLevel: m.reorder,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    batches: [
      {
        id: `demo-batch-${idx + 1}`,
        medicineId: medId,
        batchNo: m.batch,
        expiryDate: expiry,
        quantity: m.qty,
        createdAt: new Date(),
      },
    ],
  };
});

// 4. Appointments
const now = new Date();
const today10am = new Date(now);
today10am.setHours(10, 0, 0, 0);
const today1030am = new Date(today10am);
today1030am.setMinutes(30);

const today2pm = new Date(now);
today2pm.setHours(14, 0, 0, 0);
const today230pm = new Date(today2pm);
today230pm.setMinutes(30);

const future2days = new Date(now);
future2days.setDate(future2days.getDate() + 2);
future2days.setHours(11, 0, 0, 0);
const future2daysEnd = new Date(future2days);
future2daysEnd.setMinutes(30);

const past3days = new Date(now);
past3days.setDate(past3days.getDate() - 3);
past3days.setHours(9, 0, 0, 0);
const past3daysEnd = new Date(past3days);
past3daysEnd.setMinutes(30);

export const DEMO_APPOINTMENTS: DemoAppointment[] = [
  {
    id: "demo-appt-1",
    patientId: DEMO_PATIENTS[0].id,
    clinicianId: DEMO_CLINICIANS[0].id,
    scheduledAt: today10am,
    endsAt: today1030am,
    type: "IN_PERSON",
    status: "CONFIRMED",
    reason: "Hypertension check-up and blood pressure monitoring",
    meetingUrl: null,
    cancelReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: DEMO_PATIENTS[0].id,
      patientNo: DEMO_PATIENTS[0].patientNo,
      firstName: DEMO_PATIENTS[0].firstName,
      lastName: DEMO_PATIENTS[0].lastName,
      contactNumber: DEMO_PATIENTS[0].contactNumber,
      profileId: DEMO_PATIENTS[0].profileId,
    },
    clinician: {
      id: DEMO_CLINICIANS[0].id,
      fullName: DEMO_CLINICIANS[0].fullName,
      email: DEMO_CLINICIANS[0].email,
    },
    consultation: null,
  },
  {
    id: "demo-appt-2",
    patientId: DEMO_PATIENTS[1].id,
    clinicianId: DEMO_CLINICIANS[0].id,
    scheduledAt: today2pm,
    endsAt: today230pm,
    type: "ONLINE",
    status: "CONFIRMED",
    reason: "Teleconsultation for mild cough and seasonal allergy review",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
    cancelReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: DEMO_PATIENTS[1].id,
      patientNo: DEMO_PATIENTS[1].patientNo,
      firstName: DEMO_PATIENTS[1].firstName,
      lastName: DEMO_PATIENTS[1].lastName,
      contactNumber: DEMO_PATIENTS[1].contactNumber,
      profileId: DEMO_PATIENTS[1].profileId,
    },
    clinician: {
      id: DEMO_CLINICIANS[0].id,
      fullName: DEMO_CLINICIANS[0].fullName,
      email: DEMO_CLINICIANS[0].email,
    },
    consultation: null,
  },
  {
    id: "demo-appt-3",
    patientId: DEMO_PATIENTS[2].id,
    clinicianId: DEMO_CLINICIANS[1].id,
    scheduledAt: future2days,
    endsAt: future2daysEnd,
    type: "ONLINE",
    status: "PENDING",
    reason: "Follow up on asthma inhaler prescription",
    meetingUrl: null,
    cancelReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: DEMO_PATIENTS[2].id,
      patientNo: DEMO_PATIENTS[2].patientNo,
      firstName: DEMO_PATIENTS[2].firstName,
      lastName: DEMO_PATIENTS[2].lastName,
      contactNumber: DEMO_PATIENTS[2].contactNumber,
      profileId: DEMO_PATIENTS[2].profileId,
    },
    clinician: {
      id: DEMO_CLINICIANS[1].id,
      fullName: DEMO_CLINICIANS[1].fullName,
      email: DEMO_CLINICIANS[1].email,
    },
    consultation: null,
  },
  {
    id: "demo-appt-4",
    patientId: DEMO_PATIENTS[0].id,
    clinicianId: DEMO_CLINICIANS[0].id,
    scheduledAt: past3days,
    endsAt: past3daysEnd,
    type: "IN_PERSON",
    status: "COMPLETED",
    reason: "General physical examination and baseline vital signs",
    meetingUrl: null,
    cancelReason: null,
    createdAt: past3days,
    updatedAt: past3days,
    patient: {
      id: DEMO_PATIENTS[0].id,
      patientNo: DEMO_PATIENTS[0].patientNo,
      firstName: DEMO_PATIENTS[0].firstName,
      lastName: DEMO_PATIENTS[0].lastName,
      contactNumber: DEMO_PATIENTS[0].contactNumber,
      profileId: DEMO_PATIENTS[0].profileId,
    },
    clinician: {
      id: DEMO_CLINICIANS[0].id,
      fullName: DEMO_CLINICIANS[0].fullName,
      email: DEMO_CLINICIANS[0].email,
    },
    consultation: {
      id: "demo-cons-1",
      chiefComplaint: "Routine checkup",
      diagnosis: "Controlled Essential Hypertension",
      startedAt: past3days,
      endedAt: past3daysEnd,
    },
  },
];

// 5. Prescriptions
export const DEMO_PRESCRIPTIONS: DemoPrescription[] = [
  {
    id: "demo-rx-1",
    prescriptionNo: "RX-2026-0001",
    consultationId: "demo-cons-1",
    patientId: DEMO_PATIENTS[0].id,
    clinicianId: DEMO_CLINICIANS[0].id,
    status: "ISSUED",
    notes: "Take after meals. Monitor daily blood pressure.",
    voidReason: null,
    issuedAt: past3days,
    dispensedAt: null,
    createdAt: past3days,
    updatedAt: past3days,
    patient: DEMO_PATIENTS[0],
    clinician: DEMO_CLINICIANS[0],
    consultation: {
      id: "demo-cons-1",
      chiefComplaint: "Routine checkup",
      startedAt: past3days,
      endedAt: past3daysEnd,
      diagnosis: "Controlled Essential Hypertension",
      treatmentPlan: "Maintain low sodium diet and regular exercise",
    },
    items: [
      {
        id: "demo-rx-item-1",
        prescriptionId: "demo-rx-1",
        medicineId: DEMO_MEDICINES[6].id, // Losartan 50mg
        dosage: "50mg",
        frequency: "Once daily in the morning",
        durationDays: 30,
        quantity: 30,
        instructions: "Take with or without food",
        medicine: DEMO_MEDICINES[6],
      },
    ],
    stockMovements: [],
  },
];

// In-memory mutable arrays for demo session interactions
export const demoStore = {
  patients: [...DEMO_PATIENTS],
  medicines: [...DEMO_MEDICINES],
  appointments: [...DEMO_APPOINTMENTS],
  prescriptions: [...DEMO_PRESCRIPTIONS],
};
