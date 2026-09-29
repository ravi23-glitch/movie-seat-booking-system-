import { NextRequest } from "next/server";
import { adminController } from "@/controllers/admin.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function POST(req: NextRequest) {
  const logger = logRequest(req, "POST /api/admin/screens");
  const res = await adminController.createScreen(req);
  logger.end(res.status);
  return res;
}
