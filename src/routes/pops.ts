import { Router } from "express";
import PopsController from "../Http/Controllers/V2/PopsController";

// PercentilController


const popsRouter = Router();

// Instâncias de Controllers.
const controllers = {
    gponPops: new PopsController(),
}


popsRouter.get('/get', controllers.gponPops.index);

export default popsRouter;