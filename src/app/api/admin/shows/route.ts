import { NextRequest } from "next/server";
import { adminController } from "@/controllers/admin.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function GET(req: NextRequest) {
  return await adminController.getShows(req);
}

export async function POST(req: NextRequest) {
  const logger = logRequest(req, "POST /api/admin/shows");
  const res = await adminController.createShow(req);
  logger.end(res.status);
  return res;
}
