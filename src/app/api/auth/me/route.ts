import { NextRequest } from "next/server";
import { authController } from "@/controllers/auth.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function GET(req: NextRequest) {
  const logger = logRequest(req, "GET /api/auth/me");
  const res = await authController.getMe(req);
  logger.end(res.status);
  return res;
}
