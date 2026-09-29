import { NextRequest } from "next/server";
import { movieController } from "@/controllers/movie.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const logger = logRequest(req, `GET /api/movies/${params.id}`);
  const res = await movieController.getMovieById(req, { params });
  logger.end(res.status);
  return res;
}
