# CliniQ API Reference

All endpoints are served by the backend under `/api` and reached by the browser through the frontend's same-origin proxy.

Responses use one envelope: `{ data, meta? }` on success, `{ error: { code, message, details? } }` on failure.
Role checks below are the first gate. Services then enforce ownership (e.g. patients only see their own records).

| Method | Path | Access | Module |
| --- | --- | --- | --- |
| GET | `/api/appointments` | Any signed-in user | appointments |
| POST | `/api/appointments` | Any signed-in user | appointments |
| GET | `/api/appointments/:id` | Any signed-in user | appointments |
| PATCH | `/api/appointments/:id` | Any signed-in user | appointments |
| GET | `/api/appointments/:id/messages` | CLINICIAN, PATIENT | consultations |
| POST | `/api/appointments/:id/messages` | CLINICIAN, PATIENT | consultations |
| POST | `/api/appointments/:id/messages/read` | CLINICIAN, PATIENT | consultations |
| PATCH | `/api/appointments/:id/status` | Any signed-in user | appointments |
| GET | `/api/appointments/slots` | Any signed-in user | appointments |
| POST | `/api/auth/login` | Public | auth |
| POST | `/api/auth/logout` | Public | auth |
| POST | `/api/auth/register` | Public | auth |
| GET | `/api/clinicians` | Any signed-in user | auth |
| GET | `/api/consultations` | Any signed-in user | consultations |
| POST | `/api/consultations` | CLINICIAN, ADMIN | consultations |
| GET | `/api/consultations/:id` | Any signed-in user | consultations |
| PATCH | `/api/consultations/:id` | CLINICIAN, ADMIN | consultations |
| POST | `/api/consultations/:id/complete` | CLINICIAN, ADMIN | consultations |
| GET | `/api/dashboard` | Any signed-in user | dashboard |
| GET | `/api/health` | Public | shared |
| GET | `/api/me` | Any signed-in user | auth |
| GET | `/api/medicines` | ADMIN, STAFF, CLINICIAN | medicines |
| POST | `/api/medicines` | ADMIN, STAFF | medicines |
| GET | `/api/medicines/:id` | ADMIN, STAFF, CLINICIAN | medicines |
| PATCH | `/api/medicines/:id` | ADMIN, STAFF | medicines |
| POST | `/api/medicines/:id/batches` | ADMIN, STAFF | medicines |
| POST | `/api/medicines/:id/movements` | ADMIN, STAFF | medicines |
| GET | `/api/medicines/alerts` | ADMIN, STAFF, CLINICIAN | medicines |
| GET | `/api/medicines/movements` | ADMIN, STAFF, CLINICIAN | medicines |
| GET | `/api/patients` | ADMIN, STAFF, CLINICIAN | patients |
| POST | `/api/patients` | Any signed-in user | patients |
| GET | `/api/patients/:id` | Any signed-in user | patients |
| PATCH | `/api/patients/:id` | Any signed-in user | patients |
| PATCH | `/api/patients/:id/archive` | ADMIN, STAFF | patients |
| GET | `/api/patients/:id/history` | Any signed-in user | patients |
| GET | `/api/prescriptions` | Any signed-in user | prescriptions |
| POST | `/api/prescriptions` | CLINICIAN, ADMIN | prescriptions |
| GET | `/api/prescriptions/:id` | Any signed-in user | prescriptions |
| PATCH | `/api/prescriptions/:id` | CLINICIAN, ADMIN | prescriptions |
| POST | `/api/prescriptions/:id/dispense` | STAFF, ADMIN | prescriptions |
| POST | `/api/prescriptions/:id/issue` | CLINICIAN, ADMIN | prescriptions |
| POST | `/api/prescriptions/:id/void` | CLINICIAN, ADMIN | prescriptions |
| GET | `/api/prescriptions/stats` | Any signed-in user | prescriptions |
| GET | `/api/reports/:reportKey` | ADMIN, STAFF, CLINICIAN | reports |
| GET | `/api/users` | ADMIN | auth |
| POST | `/api/users` | ADMIN | auth |
| PATCH | `/api/users/:id` | ADMIN | auth |

_Generated from `src/modules/*/adapters/inbound/http/*.controller.ts`._
