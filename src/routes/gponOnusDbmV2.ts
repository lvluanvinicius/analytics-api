import { Response, Request, Router } from "express";
import GponAnalyticsController from "../Http/Controllers/V2/GponAnalyticsController";
import GponOnusDbmController from "../Http/Controllers/GponOnusDbmController";

const gponOnusDbmRouteV2 = Router();

// Instâncias de Controllers.
const controllers = {
    gponOnusDbm: new GponOnusDbmController(),
    gponAnalytics: new GponAnalyticsController(),
}

/**
 * //
 */
gponOnusDbmRouteV2.get("/onu", controllers.gponAnalytics.test);

gponOnusDbmRouteV2.get("/equipaments", controllers.gponOnusDbm.GetEquipaments);

gponOnusDbmRouteV2.get("/equipaments/create", controllers.gponOnusDbm.CreateEquipaments);


export default gponOnusDbmRouteV2;