import { NextRequest } from "next/server";
import { movieController } from "@/controllers/movie.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function GET(req: NextRequest) {
  const logger = logRequest(req, "GET /api/movies");
  const res = await movieController.getMovies(req);
  logger.end(res.status);
  return res;
}
