import { inMemoryDb } from "@/lib/store";
import { MovieDto } from "@/types";

export class MovieRepository {
  async findAll(options?: { search?: string; genre?: string; page?: number; limit?: number }): Promise<{
    movies: MovieDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let movies = Array.from(inMemoryDb.state.movies.values());

    if (options?.search) {
      const q = options.search.toLowerCase();
      movies = movies.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q)
      );
    }

    if (options?.genre && options.genre !== "ALL") {
      const g = options.genre.toLowerCase();
      movies = movies.filter((m) => m.genre.toLowerCase().includes(g));
    }

    const total = movies.length;
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const start = (page - 1) * limit;
    const paginated = movies.slice(start, start + limit);

    return {
      movies: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(id: string): Promise<MovieDto | null> {
    return inMemoryDb.state.movies.get(id) || null;
  }

  async create(data: Omit<MovieDto, "id">): Promise<MovieDto> {
    const id = `movie-${Date.now()}`;
    const movie: MovieDto = { id, ...data };
    inMemoryDb.state.movies.set(id, movie);
    return movie;
  }

  async update(id: string, data: Partial<Omit<MovieDto, "id">>): Promise<MovieDto | null> {
    const movie = inMemoryDb.state.movies.get(id);
    if (!movie) return null;
    const updated = { ...movie, ...data };
    inMemoryDb.state.movies.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return inMemoryDb.state.movies.delete(id);
  }
}

export const movieRepository = new MovieRepository();
