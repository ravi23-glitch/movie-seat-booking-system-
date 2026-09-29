import { movieRepository } from "@/repositories/movie.repository";
import { showRepository } from "@/repositories/show.repository";
import { NotFoundError } from "@/lib/errors";
import { MovieDto, ShowDto } from "@/types";

export class MovieService {
  async getMovies(options?: { search?: string; genre?: string; page?: number; limit?: number }) {
    return await movieRepository.findAll(options);
  }

  async getMovieDetails(id: string): Promise<{ movie: MovieDto; shows: ShowDto[] }> {
    const movie = await movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundError(`Movie with ID ${id} not found`);
    }

    const shows = await showRepository.findByMovieId(id);
    return { movie, shows };
  }

  async createMovie(data: Omit<MovieDto, "id">): Promise<MovieDto> {
    return await movieRepository.create(data);
  }

  async updateMovie(id: string, data: Partial<Omit<MovieDto, "id">>): Promise<MovieDto> {
    const updated = await movieRepository.update(id, data);
    if (!updated) {
      throw new NotFoundError(`Movie with ID ${id} not found`);
    }
    return updated;
  }

  async deleteMovie(id: string): Promise<boolean> {
    const deleted = await movieRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Movie with ID ${id} not found`);
    }
    return true;
  }
}

export const movieService = new MovieService();
