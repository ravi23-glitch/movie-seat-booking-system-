import { NextRequest } from "next/server";
import { showController } from "@/controllers/show.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const logger = logRequest(req, `GET /api/shows/${params.id}/seats`);
  const res = await showController.getShowSeats(req, { params });
  logger.end(res.status);
  return res;
}
