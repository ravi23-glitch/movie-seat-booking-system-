import { NextRequest, NextResponse } from "next/server";
import { movieService } from "@/services/movie.service";
import { movieQuerySchema } from "@/validators";
import { handleError } from "@/middlewares/error.middleware";

export class MovieController {
  async getMovies(req: NextRequest) {
    try {
      const searchParams = req.nextUrl.searchParams;
      const search = searchParams.get("search") || undefined;
      const genre = searchParams.get("genre") || undefined;
      const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;

      const validated = movieQuerySchema.parse({ search, genre, page, limit });
      const result = await movieService.getMovies(validated);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (err) {
      return handleError(err);
    }
  }

  async getMovieById(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const result = await movieService.getMovieDetails(params.id);
      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (err) {
      return handleError(err);
    }
  }
}

export const movieController = new MovieController();
