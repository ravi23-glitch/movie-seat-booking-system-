import { NextRequest } from "next/server";
import { adminController } from "@/controllers/admin.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const logger = logRequest(req, `PUT /api/admin/movies/${params.id}`);
  const res = await adminController.updateMovie(req, { params });
  logger.end(res.status);
  return res;
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const logger = logRequest(req, `DELETE /api/admin/movies/${params.id}`);
  const res = await adminController.deleteMovie(req, { params });
  logger.end(res.status);
  return res;
}
