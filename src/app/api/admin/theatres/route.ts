import { NextRequest } from "next/server";
import { adminController } from "@/controllers/admin.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function GET(req: NextRequest) {
  return await adminController.getTheatres(req);
}

export async function POST(req: NextRequest) {
  const logger = logRequest(req, "POST /api/admin/theatres");
  const res = await adminController.createTheatre(req);
  logger.end(res.status);
  return res;
}
