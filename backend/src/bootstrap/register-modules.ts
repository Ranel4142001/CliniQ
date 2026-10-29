import type { Hono } from "hono";
import { healthController } from "@backend/shared/adapters/http/health.controller";
import { authController } from "@backend/modules/auth";
import { patientsController } from "@backend/modules/patients";
import { appointmentsController } from "@backend/modules/appointments";
import {
  consultationsController,
  consultationChatController,
} from "@backend/modules/consultations";
import { medicinesController } from "@backend/modules/medicines";
import { prescriptionsController } from "@backend/modules/prescriptions";
import { dashboardController } from "@backend/modules/dashboard";
import { reportsController } from "@backend/modules/reports";

const CONTROLLERS = [
  healthController,
  authController,
  patientsController,
  appointmentsController,
  consultationChatController,
  consultationsController,
  medicinesController,
  prescriptionsController,
  dashboardController,
  reportsController,
];

/** Mounts every module's inbound HTTP adapter on the application. */
export function registerModules(app: Hono): void {
  for (const controller of CONTROLLERS) {
    app.route("/", controller);
  }
}
