import { NextRequest } from "next/server";
import { adminController } from "@/controllers/admin.controller";
import { movieController } from "@/controllers/movie.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function GET(req: NextRequest) {
  return await movieController.getMovies(req);
}

export async function POST(req: NextRequest) {
  const logger = logRequest(req, "POST /api/admin/movies");
  const res = await adminController.createMovie(req);
  logger.end(res.status);
  return res;
}
