/** What appointments needs to know about a patient (provided by the patients module). */
export interface PatientRef {
  id: string;
  profileId: string | null;
  isArchived: boolean;
}

export interface PatientLookupPort {
  findById(id: string): Promise<PatientRef | null>;
  findByProfileId(profileId: string): Promise<PatientRef | null>;
}
