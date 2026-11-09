/**
 * prisma/seed.ts
 * Comprehensive database seed script for CliniQ.
 * Seeds:
 *  - 1 System Admin, 2 Clinicians, 2 Staff
 *  - 20 Fictional Patients with complete health profiles
 *  - 30 Common Clinic Medicines with batches (healthy, low stock, expiring)
 *  - Past & upcoming appointments
 *
 * Usage:
 *   npm run db:seed
 *
 * Requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * SEED_ADMIN_PASSWORD and SEED_STAFF_PASSWORD (used for the sample clinician, staff and patient accounts).
 */

import { PrismaClient, Role, Sex, AppointmentType, AppointmentStatus } from "@prisma/client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { recordNumberGenerator } from "@backend/shared/infrastructure/persistence/record-number";
import { RECORD_PREFIXES } from "@backend/shared/domain/record-number";

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable for seeding: ${name}`);
  return value;
}

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@cliniq.local";
const ADMIN_PASSWORD = requireEnv("SEED_ADMIN_PASSWORD");
const STAFF_PASSWORD = requireEnv("SEED_STAFF_PASSWORD");
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "System Administrator";

const CLINICIANS = [
  { email: "dr.cruz@cliniq.local", name: "Dr. Alberto Cruz, MD", role: Role.CLINICIAN },
  { email: "dr.reyes@cliniq.local", name: "Dr. Maria Elena Reyes, MD", role: Role.CLINICIAN },
];

const STAFF_MEMBERS = [
  { email: "staff.ana@cliniq.local", name: "Ana Santos", role: Role.STAFF },
  { email: "staff.mark@cliniq.local", name: "Mark Bautista", role: Role.STAFF },
];

const PATIENTS = [
  {
    firstName: "Juan",
    lastName: "Dela Cruz",
    birthDate: new Date("1985-06-12"),
    sex: Sex.MALE,
    contactNumber: "09171234567",
    address: "123 Mabini St, Barangay San Jose, Pasig City",
    emergencyName: "Juana Dela Cruz",
    emergencyContact: "09171234568",
    bloodType: "O+",
    existingConditions: "Hypertension",
  },
  {
    firstName: "Maria Clara",
    lastName: "Santos",
    birthDate: new Date("1992-03-24"),
    sex: Sex.FEMALE,
    contactNumber: "09182345678",
    address: "45 Luna St, Barangay Kapitolyo, Pasig City",
    emergencyName: "Crisostomo Ibarra",
    emergencyContact: "09182345679",
    bloodType: "A+",
    allergies: "Penicillin",
  },
  {
    firstName: "Jose",
    lastName: "Rizal",
    birthDate: new Date("1990-12-30"),
    sex: Sex.MALE,
    contactNumber: "09193456789",
    address: "78 Real St, Calamba, Laguna",
    emergencyName: "Teodora Alonso",
    emergencyContact: "09193456780",
    bloodType: "B+",
    existingConditions: "Asthma",
  },
  {
    firstName: "Gabriela",
    lastName: "Silang",
    birthDate: new Date("1995-03-19"),
    sex: Sex.FEMALE,
    contactNumber: "09204567890",
    address: "12 Ilocos St, Santa, Ilocos Sur",
    emergencyName: "Diego Silang",
    emergencyContact: "09204567891",
    bloodType: "AB+",
  },
  {
    firstName: "Andres",
    lastName: "Bonifacio",
    birthDate: new Date("1988-11-30"),
    sex: Sex.MALE,
    contactNumber: "09215678901",
    address: "99 Tondo St, Manila",
    emergencyName: "Gregoria De Jesus",
    emergencyContact: "09215678902",
    bloodType: "O+",
    existingConditions: "Type 2 Diabetes",
  },
  {
    firstName: "Melchora",
    lastName: "Aquino",
    birthDate: new Date("1970-01-06"),
    sex: Sex.FEMALE,
    contactNumber: "09226789012",
    address: "88 Banlat Rd, Tandang Sora, Quezon City",
    emergencyName: "Juan Aquino",
    emergencyContact: "09226789013",
    bloodType: "A-",
    existingConditions: "Osteoarthritis",
  },
  {
    firstName: "Emilio",
    lastName: "Aguinaldo",
    birthDate: new Date("1983-03-22"),
    sex: Sex.MALE,
    contactNumber: "09237890123",
    address: "21 Kawit Highway, Cavite",
    emergencyName: "Hilaria Del Rosario",
    emergencyContact: "09237890124",
    bloodType: "B-",
  },
  {
    firstName: "Apolinario",
    lastName: "Mabini",
    birthDate: new Date("1987-07-23"),
    sex: Sex.MALE,
    contactNumber: "09248901234",
    address: "34 Talaga, Tanauan, Batangas",
    emergencyName: "Inocencio Mabini",
    emergencyContact: "09248901235",
    bloodType: "AB-",
  },
  {
    firstName: "Marcelo",
    lastName: "Del Pilar",
    birthDate: new Date("1986-08-30"),
    sex: Sex.MALE,
    contactNumber: "09259012345",
    address: "56 Cupang, Bulakan, Bulacan",
    emergencyName: "Marciana Del Pilar",
    emergencyContact: "09259012346",
    bloodType: "O+",
    allergies: "NSAIDs",
  },
  {
    firstName: "Antonio",
    lastName: "Luna",
    birthDate: new Date("1989-10-29"),
    sex: Sex.MALE,
    contactNumber: "09260123456",
    address: "15 Urbiztondo St, Binondo, Manila",
    emergencyName: "Joaquin Luna",
    emergencyContact: "09260123457",
    bloodType: "A+",
    existingConditions: "Hypertension",
  },
  {
    firstName: "Teresa",
    lastName: "Magbanua",
    birthDate: new Date("1994-10-13"),
    sex: Sex.FEMALE,
    contactNumber: "09271234567",
    address: "7 Pototan, Iloilo",
    emergencyName: "Alejandro Balderas",
    emergencyContact: "09271234568",
    bloodType: "B+",
  },
  {
    firstName: "Gregorio",
    lastName: "Del Pilar",
    birthDate: new Date("1996-11-14"),
    sex: Sex.MALE,
    contactNumber: "09282345678",
    address: "32 San Jose, Bulakan, Bulacan",
    emergencyName: "Felipa Sempio",
    emergencyContact: "09282345679",
    bloodType: "O+",
  },
  {
    firstName: "Francisco",
    lastName: "Dagohoy",
    birthDate: new Date("1984-05-10"),
    sex: Sex.MALE,
    contactNumber: "09293456789",
    address: "10 Inabanga, Bohol",
    emergencyName: "Elena Dagohoy",
    emergencyContact: "09293456780",
    bloodType: "A+",
    existingConditions: "Gout",
  },
  {
    firstName: "Lapu",
    lastName: "Lapu",
    birthDate: new Date("1982-04-27"),
    sex: Sex.MALE,
    contactNumber: "09304567890",
    address: "1 Punta Engano, Lapu-Lapu City, Cebu",
    emergencyName: "Bulakna Mactan",
    emergencyContact: "09304567891",
    bloodType: "O+",
  },
  {
    firstName: "Corazon",
    lastName: "Aquino",
    birthDate: new Date("1993-01-25"),
    sex: Sex.FEMALE,
    contactNumber: "09315678901",
    address: "25 Times St, West Triangle, Quezon City",
    emergencyName: "Benigno Aquino",
    emergencyContact: "09315678902",
    bloodType: "A+",
  },
  {
    firstName: "Ramon",
    lastName: "Magsaysay",
    birthDate: new Date("1989-08-31"),
    sex: Sex.MALE,
    contactNumber: "09326789012",
    address: "4 Castillejos, Zambales",
    emergencyName: "Luz Banzon",
    emergencyContact: "09326789013",
    bloodType: "B+",
  },
  {
    firstName: "Manuel",
    lastName: "Quezon",
    birthDate: new Date("1987-08-19"),
    sex: Sex.MALE,
    contactNumber: "09337890123",
    address: "19 Baler, Aurora",
    emergencyName: "Aurora Aragon",
    emergencyContact: "09337890124",
    bloodType: "O+",
    existingConditions: "Asthma",
  },
  {
    firstName: "Teodora",
    lastName: "Alonso",
    birthDate: new Date("1975-11-09"),
    sex: Sex.FEMALE,
    contactNumber: "09348901234",
    address: "5 Santa Cruz, Manila",
    emergencyName: "Francisco Mercado",
    emergencyContact: "09348901235",
    bloodType: "A+",
    existingConditions: "Type 2 Diabetes",
  },
  {
    firstName: "Carlos",
    lastName: "Garcia",
    birthDate: new Date("1991-11-04"),
    sex: Sex.MALE,
    contactNumber: "09359012345",
    address: "8 Talibon, Bohol",
    emergencyName: "Leonila Dimataga",
    emergencyContact: "09359012346",
    bloodType: "AB+",
  },
  {
    firstName: "Diego",
    lastName: "Silang",
    birthDate: new Date("1988-12-16"),
    sex: Sex.MALE,
    contactNumber: "09360123456",
    address: "14 Vigan City, Ilocos Sur",
    emergencyName: "Gabriela Silang",
    emergencyContact: "09360123457",
    bloodType: "O+",
  },
];

const MEDICINES = [
  { name: "Amoxicillin", genericName: "Amoxicillin Trihydrate", dosageForm: "Capsule", strength: "500mg", unit: "capsule", reorderLevel: 50, batchNo: "B26-AMX01", qty: 500, daysToExp: 450 },
  { name: "Paracetamol", genericName: "Acetaminophen", dosageForm: "Tablet", strength: "500mg", unit: "tablet", reorderLevel: 100, batchNo: "B26-PCM01", qty: 1000, daysToExp: 600 },
  { name: "Ibuprofen", genericName: "Ibuprofen", dosageForm: "Tablet", strength: "400mg", unit: "tablet", reorderLevel: 30, batchNo: "B26-IBU01", qty: 8, daysToExp: 300 }, // Low Stock
  { name: "Cetirizine", genericName: "Cetirizine Hydrochloride", dosageForm: "Tablet", strength: "10mg", unit: "tablet", reorderLevel: 40, batchNo: "B26-CET01", qty: 350, daysToExp: 400 },
  { name: "Metformin", genericName: "Metformin Hydrochloride", dosageForm: "Tablet", strength: "500mg", unit: "tablet", reorderLevel: 50, batchNo: "B26-MET01", qty: 400, daysToExp: 500 },
  { name: "Amlodipine", genericName: "Amlodipine Besylate", dosageForm: "Tablet", strength: "5mg", unit: "tablet", reorderLevel: 40, batchNo: "B26-AML01", qty: 45, daysToExp: 18 }, // Expiring soon (<30 days)
  { name: "Losartan", genericName: "Losartan Potassium", dosageForm: "Tablet", strength: "50mg", unit: "tablet", reorderLevel: 50, batchNo: "B26-LOS01", qty: 600, daysToExp: 550 },
  { name: "Salbutamol", genericName: "Salbutamol Sulfate", dosageForm: "Syrup", strength: "2mg/5mL 60mL", unit: "bottle", reorderLevel: 20, batchNo: "B26-SAL01", qty: 80, daysToExp: 360 },
  { name: "Mefenamic Acid", genericName: "Mefenamic Acid", dosageForm: "Capsule", strength: "500mg", unit: "capsule", reorderLevel: 30, batchNo: "B26-MEF01", qty: 250, daysToExp: 420 },
  { name: "Omeprazole", genericName: "Omeprazole", dosageForm: "Capsule", strength: "20mg", unit: "capsule", reorderLevel: 25, batchNo: "B26-OME01", qty: 5, daysToExp: 320 }, // Low Stock
  { name: "Azithromycin", genericName: "Azithromycin Dihydrate", dosageForm: "Tablet", strength: "500mg", unit: "tablet", reorderLevel: 20, batchNo: "B26-AZI01", qty: 120, daysToExp: 380 },
  { name: "Ciprofloxacin", genericName: "Ciprofloxacin HCl", dosageForm: "Tablet", strength: "500mg", unit: "tablet", reorderLevel: 25, batchNo: "B26-CIP01", qty: 180, daysToExp: 410 },
  { name: "Co-Amoxiclav", genericName: "Amoxicillin + Potassium Clavulanate", dosageForm: "Tablet", strength: "625mg", unit: "tablet", reorderLevel: 30, batchNo: "B26-COA01", qty: 200, daysToExp: 300 },
  { name: "Doxycycline", genericName: "Doxycycline Hyclate", dosageForm: "Capsule", strength: "100mg", unit: "capsule", reorderLevel: 20, batchNo: "B26-DOX01", qty: 150, daysToExp: 390 },
  { name: "Oral Rehydration Salts", genericName: "ORS Formulation", dosageForm: "Powder", strength: "20.5g", unit: "sachet", reorderLevel: 50, batchNo: "B26-ORS01", qty: 500, daysToExp: 700 },
  { name: "Ascorbic Acid", genericName: "Vitamin C", dosageForm: "Tablet", strength: "500mg", unit: "tablet", reorderLevel: 80, batchNo: "B26-VTC01", qty: 850, daysToExp: 650 },
  { name: "Multivitamins + Iron", genericName: "Daily Multivitamins + Ferrous Sulfate", dosageForm: "Capsule", strength: "Standard", unit: "capsule", reorderLevel: 50, batchNo: "B26-MVI01", qty: 450, daysToExp: 500 },
  { name: "Antacid Chewable", genericName: "Aluminum Hydroxide + Magnesium Hydroxide", dosageForm: "Chewable Tablet", strength: "200mg/100mg", unit: "tablet", reorderLevel: 40, batchNo: "B26-ANT01", qty: 300, daysToExp: 480 },
  { name: "Lagundi", genericName: "Vitex negundo", dosageForm: "Tablet", strength: "300mg", unit: "tablet", reorderLevel: 30, batchNo: "B26-LAG01", qty: 260, daysToExp: 365 },
  { name: "Hyoscine-N-Butylbromide", genericName: "Hyoscine Butylbromide", dosageForm: "Tablet", strength: "10mg", unit: "tablet", reorderLevel: 25, batchNo: "B26-HYO01", qty: 12, daysToExp: 400 }, // Low Stock
  { name: "Loratadine", genericName: "Loratadine", dosageForm: "Tablet", strength: "10mg", unit: "tablet", reorderLevel: 20, batchNo: "B26-LOR01", qty: 220, daysToExp: 450 },
  { name: "Gliclazide", genericName: "Gliclazide Modified Release", dosageForm: "Tablet", strength: "80mg", unit: "tablet", reorderLevel: 25, batchNo: "B26-GLI01", qty: 180, daysToExp: 390 },
  { name: "Simvastatin", genericName: "Simvastatin", dosageForm: "Tablet", strength: "20mg", unit: "tablet", reorderLevel: 20, batchNo: "B25-SIM99", qty: 30, daysToExp: -15 }, // Expired batch
  { name: "Paracetamol Syrup", genericName: "Acetaminophen Pediatric", dosageForm: "Syrup", strength: "120mg/5mL 60mL", unit: "bottle", reorderLevel: 20, batchNo: "B26-PCS01", qty: 95, daysToExp: 400 },
  { name: "Betamethasone Cream", genericName: "Betamethasone Valerate", dosageForm: "Cream", strength: "0.1% 15g", unit: "tube", reorderLevel: 15, batchNo: "B26-BET01", qty: 60, daysToExp: 350 },
  { name: "Silver Sulfadiazine Cream", genericName: "Silver Sulfadiazine", dosageForm: "Cream", strength: "1% 20g", unit: "tube", reorderLevel: 10, batchNo: "B26-SSD01", qty: 40, daysToExp: 330 },
  { name: "Povidone-Iodine", genericName: "Povidone Iodine Antiseptic", dosageForm: "Solution", strength: "10% 60mL", unit: "bottle", reorderLevel: 20, batchNo: "B26-PVI01", qty: 75, daysToExp: 600 },
  { name: "Carbocisteine", genericName: "Carbocisteine", dosageForm: "Capsule", strength: "500mg", unit: "capsule", reorderLevel: 30, batchNo: "B26-CAR01", qty: 320, daysToExp: 410 },
  { name: "Cefalexin", genericName: "Cefalexin Monohydrate", dosageForm: "Capsule", strength: "500mg", unit: "capsule", reorderLevel: 25, batchNo: "B26-CEF01", qty: 210, daysToExp: 370 },
  { name: "Tranexamic Acid", genericName: "Tranexamic Acid", dosageForm: "Capsule", strength: "500mg", unit: "capsule", reorderLevel: 20, batchNo: "B26-TRA01", qty: 6, daysToExp: 340 }, // Low Stock
];

/** Creates a confirmed Supabase auth user and returns its id. Profiles must always map to a real auth user. */
async function createAuthUser(
  supabaseAdmin: SupabaseClient,
  user: { email: string; password: string; fullName: string }
): Promise<string> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.fullName },
  });
  if (error || !data.user) {
    throw new Error(`Failed to create auth user ${user.email}: ${error?.message ?? "unknown error"}`);
  }
  return data.user.id;
}

async function main() {
  console.log("🌱  Starting CliniQ Comprehensive Seed…");

  const supabaseAdmin = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 1. Seed System Admin
  console.log("1️⃣  Seeding Admin account…");
  let adminProfile = await prisma.profile.findFirst({ where: { email: ADMIN_EMAIL } });
  if (!adminProfile) {
    const authId = await createAuthUser(supabaseAdmin, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      fullName: ADMIN_NAME,
    });
    adminProfile = await prisma.profile.create({
      data: {
        authId,
        email: ADMIN_EMAIL,
        fullName: ADMIN_NAME,
        role: Role.ADMIN,
        isActive: true,
      },
    });
    console.log(`   ✅ Created Admin: ${ADMIN_EMAIL}`);
  } else {
    console.log(`   ℹ️ Admin already exists: ${ADMIN_EMAIL}`);
  }

  // 2. Seed Clinicians
  console.log("2️⃣  Seeding Clinicians…");
  const seededClinicians = [];
  for (const c of CLINICIANS) {
    let prof = await prisma.profile.findFirst({ where: { email: c.email } });
    if (!prof) {
      const authId = await createAuthUser(supabaseAdmin, {
        email: c.email,
        password: STAFF_PASSWORD,
        fullName: c.name,
      });
      prof = await prisma.profile.create({
        data: {
          authId,
          email: c.email,
          fullName: c.name,
          role: c.role,
          isActive: true,
        },
      });
      console.log(`   ✅ Created Clinician: ${c.name}`);
    }
    seededClinicians.push(prof);
  }

  // 3. Seed Staff
  console.log("3️⃣  Seeding Staff…");
  for (const s of STAFF_MEMBERS) {
    const existing = await prisma.profile.findFirst({ where: { email: s.email } });
    if (!existing) {
      const authId = await createAuthUser(supabaseAdmin, {
        email: s.email,
        password: STAFF_PASSWORD,
        fullName: s.name,
      });
      await prisma.profile.create({
        data: {
          authId,
          email: s.email,
          fullName: s.name,
          role: s.role,
          isActive: true,
        },
      });
      console.log(`   ✅ Created Staff: ${s.name}`);
    }
  }

  // 4. Seed 20 Patients
  console.log("4️⃣  Seeding 20 Fictional Patients…");
  const seededPatients = [];
  for (const p of PATIENTS) {
    // Matched by name + birth date, so re-running the seed never duplicates a patient.
    let patient = await prisma.patient.findFirst({
      where: { firstName: p.firstName, lastName: p.lastName, birthDate: p.birthDate },
    });
    if (!patient) {
      const patientNo = await recordNumberGenerator.next(RECORD_PREFIXES.PATIENT, async (candidate) =>
        Boolean(await prisma.patient.findUnique({ where: { patientNo: candidate }, select: { id: true } }))
      );
      patient = await prisma.patient.create({
        data: {
          ...p,
          patientNo,
          consentGivenAt: new Date(),
        },
      });
    }
    seededPatients.push(patient);
  }
  console.log(`   ✅ Seeded ${seededPatients.length} patients.`);

  // 5. Seed 30 Medicines & Batches
  console.log("5️⃣  Seeding 30 Medicines & Batches…");
  for (const m of MEDICINES) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + m.daysToExp);

    const medicine = await prisma.medicine.upsert({
      where: {
        name_strength_dosageForm: {
          name: m.name,
          strength: m.strength,
          dosageForm: m.dosageForm,
        },
      },
      update: {
        genericName: m.genericName,
        unit: m.unit,
        reorderLevel: m.reorderLevel,
      },
      create: {
        name: m.name,
        genericName: m.genericName,
        dosageForm: m.dosageForm,
        strength: m.strength,
        unit: m.unit,
        reorderLevel: m.reorderLevel,
      },
    });

    await prisma.medicineBatch.upsert({
      where: {
        medicineId_batchNo: {
          medicineId: medicine.id,
          batchNo: m.batchNo,
        },
      },
      update: {
        quantity: m.qty,
        expiryDate: expiry,
      },
      create: {
        medicineId: medicine.id,
        batchNo: m.batchNo,
        quantity: m.qty,
        expiryDate: expiry,
      },
    });
  }
  console.log(`   ✅ Seeded ${MEDICINES.length} medicines and stock batches.`);

  // 6. Seed Sample Appointments
  console.log("6️⃣  Seeding Appointments…");
  if (seededClinicians.length > 0 && seededPatients.length >= 3) {
    const primaryClinician = seededClinicians[0];
    const patientA = seededPatients[0];
    const patientB = seededPatients[1];

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    pastDate.setHours(9, 0, 0, 0);
    const pastDateEnd = new Date(pastDate);
    pastDateEnd.setMinutes(pastDateEnd.getMinutes() + 30);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    futureDate.setHours(14, 0, 0, 0);
    const futureDateEnd = new Date(futureDate);
    futureDateEnd.setMinutes(futureDateEnd.getMinutes() + 30);

    const existingAppts = await prisma.appointment.count();
    if (existingAppts === 0) {
      await prisma.appointment.create({
        data: {
          patientId: patientA.id,
          clinicianId: primaryClinician.id,
          scheduledAt: pastDate,
          endsAt: pastDateEnd,
          type: AppointmentType.IN_PERSON,
          status: AppointmentStatus.COMPLETED,
          reason: "Routine hypertension follow-up and prescription refill",
        },
      });

      await prisma.appointment.create({
        data: {
          patientId: patientB.id,
          clinicianId: primaryClinician.id,
          scheduledAt: futureDate,
          endsAt: futureDateEnd,
          type: AppointmentType.ONLINE,
          status: AppointmentStatus.CONFIRMED,
          reason: "Mild fever and sore throat teleconsultation",
          meetingUrl: "https://meet.google.com/abc-defg-hij",
        },
      });
      console.log("   ✅ Seeded sample past and upcoming appointments.");
    }
  }

  // 7. Sample patient login, linked to the patient who has the online consultation,
  //    so the patient side of the consultation chat can be tested.
  console.log("7️⃣  Seeding sample patient login…");
  const PATIENT_EMAIL = "patient.maria@cliniq.local";
  const onlineVisit = await prisma.appointment.findFirst({
    where: { type: AppointmentType.ONLINE },
    include: { patient: true },
    orderBy: { scheduledAt: "asc" },
  });
  const existingPatientLogin = await prisma.profile.findFirst({ where: { email: PATIENT_EMAIL } });
  if (onlineVisit && !existingPatientLogin && !onlineVisit.patient.profileId) {
    const fullName = `${onlineVisit.patient.firstName} ${onlineVisit.patient.lastName}`;
    const authId = await createAuthUser(supabaseAdmin, { email: PATIENT_EMAIL, password: STAFF_PASSWORD, fullName });
    const profile = await prisma.profile.create({
      data: { authId, email: PATIENT_EMAIL, fullName, role: Role.PATIENT, isActive: true },
    });
    await prisma.patient.update({ where: { id: onlineVisit.patientId }, data: { profileId: profile.id } });
    console.log(`   ✅ Created patient login for ${fullName}: ${PATIENT_EMAIL}`);
  } else {
    console.log("   ℹ️ Sample patient login already exists (or no online visit to link).");
  }

  console.log("\n🎉 CliniQ Database Seed completed successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
