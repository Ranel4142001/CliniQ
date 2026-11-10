import { describe, it, expect } from "vitest";
import { listPatientsSchema } from "@backend/modules/patients/application/dto/patient.schema";

describe("listPatientsSchema", () => {
  it('reads isArchived="false" as active patients (the booking form sends this)', () => {
    expect(listPatientsSchema.parse({ isArchived: "false" }).isArchived).toBe(false);
  });

  it('reads isArchived="true" as archived patients', () => {
    expect(listPatientsSchema.parse({ isArchived: "true" }).isArchived).toBe(true);
  });

  it("defaults to active patients", () => {
    expect(listPatientsSchema.parse({}).isArchived).toBe(false);
  });
});
