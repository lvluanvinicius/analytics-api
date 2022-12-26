import { Router } from "express";
import GponAnalytics from "../Http/Controllers/GponAnalyticsController";

const gponAnalyticsRouter = Router();

// Instâncias de Controllers.
const controllers = {
    gponAnalytics: new GponAnalytics(),
}


// Nethods GET.

gponAnalyticsRouter.get("/analytics/count-onu", controllers.gponAnalytics.CountOnusPerBoxes);

// gponAnalyticsRouter.get("/analytics/get-mean-port", controllers.gponAnalytics.GetMeanPortDBM);


// Nethods POST.

export default gponAnalyticsRouter;