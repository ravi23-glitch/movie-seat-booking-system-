import { NextRequest } from "next/server";
import { authController } from "@/controllers/auth.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function POST(req: NextRequest) {
  const logger = logRequest(req, "POST /api/auth/register");
  const res = await authController.register(req);
  logger.end(res.status);
  return res;
}
