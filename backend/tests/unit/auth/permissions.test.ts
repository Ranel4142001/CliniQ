import { describe, it, expect } from "vitest";
import { can } from "@backend/modules/auth/domain/services/permissions";
import { ROLES } from "@backend/shared/domain/roles";

describe("Permissions Matrix can() map", () => {
  it("grants ADMIN permission for user management, audit log, reports, and stock changes", () => {
    expect(can(ROLES.ADMIN, "manage_users")).toBe(true);
    expect(can(ROLES.ADMIN, "view_audit_log")).toBe(true);
    expect(can(ROLES.ADMIN, "change_stock")).toBe(true);
    expect(can(ROLES.ADMIN, "view_reports")).toBe(true);
  });

  it("denies CLINICIAN and STAFF from managing user accounts and audit logs", () => {
    expect(can(ROLES.CLINICIAN, "manage_users")).toBe(false);
    expect(can(ROLES.STAFF, "manage_users")).toBe(false);
    expect(can(ROLES.CLINICIAN, "view_audit_log")).toBe(false);
    expect(can(ROLES.STAFF, "view_audit_log")).toBe(false);
  });

  it("allows only CLINICIAN to write consultations and issue prescriptions", () => {
    expect(can(ROLES.CLINICIAN, "write_consultation")).toBe(true);
    expect(can(ROLES.CLINICIAN, "issue_prescription")).toBe(true);
    expect(can(ROLES.STAFF, "write_consultation")).toBe(false);
    expect(can(ROLES.STAFF, "issue_prescription")).toBe(false);
    expect(can(ROLES.PATIENT, "write_consultation")).toBe(false);
    expect(can(ROLES.PATIENT, "issue_prescription")).toBe(false);
  });

  it("allows only STAFF and ADMIN to change stock and STAFF to dispense prescriptions", () => {
    expect(can(ROLES.STAFF, "dispense_prescription")).toBe(true);
    expect(can(ROLES.CLINICIAN, "dispense_prescription")).toBe(false);
    expect(can(ROLES.STAFF, "change_stock")).toBe(true);
    expect(can(ROLES.CLINICIAN, "change_stock")).toBe(false);
  });

  it("restricts PATIENT from accessing unauthorized resources", () => {
    expect(can(ROLES.PATIENT, "view_medicines")).toBe(false);
    expect(can(ROLES.PATIENT, "view_reports")).toBe(false);
    expect(can(ROLES.PATIENT, "view_audit_log")).toBe(false);
    expect(can(ROLES.PATIENT, "book_appointment")).toBe(true);
  });

  it("handles null or undefined roles safely by returning false", () => {
    expect(can(null, "view_reports")).toBe(false);
    expect(can(undefined, "manage_users")).toBe(false);
  });
});
