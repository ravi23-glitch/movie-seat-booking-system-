import { NextRequest } from "next/server";
import { adminController } from "@/controllers/admin.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const logger = logRequest(req, `DELETE /api/admin/theatres/${params.id}`);
  const res = await adminController.deleteTheatre(req, { params });
  logger.end(res.status);
  return res;
}
