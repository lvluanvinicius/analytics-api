import { Router } from "express";
import ProxmoxController from "../Http/Controllers/V2/ProxmoxController";

// PercentilController


const proxmoxRouter = Router();

// Instâncias de Controllers.
const controllers = {
    proxmox: new ProxmoxController(),
}


proxmoxRouter.get('/', controllers.proxmox.index);

export default proxmoxRouter;