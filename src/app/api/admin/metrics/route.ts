import { NextRequest } from "next/server";
import { adminController } from "@/controllers/admin.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function GET(req: NextRequest) {
  const logger = logRequest(req, "GET /api/admin/metrics");
  const res = await adminController.getMetrics(req);
  logger.end(res.status);
  return res;
}
