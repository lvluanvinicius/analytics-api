import { Router } from "express";
import InterconnectionController from "../Http/Controllers/V2/InterconnectionController";

// // PercentilController


const interconnection = Router();

// // Instâncias de Controllers.
const controllers = {
    interconnection: new InterconnectionController(),
}


interconnection.get('/get', controllers.interconnection.index);

export default interconnection;