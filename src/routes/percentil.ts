import { Router } from "express";
import PercentilController from "../Http/Controllers/V2/PercentilController";

// PercentilController


const percentilRouter = Router();

// Instâncias de Controllers.
const controllers = {
    gponAnalytics: new PercentilController(),
}


percentilRouter.get('/get', controllers.gponAnalytics.index);

export default percentilRouter;