import { Router } from "express";
import GponOnusDbmController from "../Http/Controllers/GponOnusDbmController";

const gponOnusDbmRoute = Router();

// Instâncias de Controllers.
const controllers = {
    gponOnusDbm: new GponOnusDbmController(),
}



// GET Methods. 
gponOnusDbmRoute.get("/equipaments", controllers.gponOnusDbm.GetEquipaments);

gponOnusDbmRoute.get("/ports", controllers.gponOnusDbm.GetPorts);

gponOnusDbmRoute.get("/onu-per-ports", controllers.gponOnusDbm.GetOnusPerPorts);

gponOnusDbmRoute.get("/onu", controllers.gponOnusDbm.GetOnusDbm);

gponOnusDbmRoute.get("/onu/names", controllers.gponOnusDbm.GetOnusNames);


// POST Methods. 
gponOnusDbmRoute.post("/equipament/create", controllers.gponOnusDbm.CreateEquipaments);

export default gponOnusDbmRoute;