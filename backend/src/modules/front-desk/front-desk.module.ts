// Composition for the front-desk module: binds its ports to concrete adapters.
import { createFrontDeskService } from "./application/services/front-desk.service";
import { frontDeskRepository } from "./infrastructure/persistence/repositories/front-desk.repository";

export const frontDeskService = createFrontDeskService({ frontDeskRepository });
