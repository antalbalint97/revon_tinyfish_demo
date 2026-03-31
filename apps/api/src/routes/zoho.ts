import { Router, type Request, type Response } from "express";
import { getZohoAdapterStatus } from "../integrations/zoho/client.js";

const router = Router();

router.get("/status", (_request: Request, response: Response) => {
  response.json(getZohoAdapterStatus());
});

export default router;
