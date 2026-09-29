import { bookingRepository } from "@/repositories/booking.repository";
import { movieRepository } from "@/repositories/movie.repository";
import { theatreRepository, screenRepository } from "@/repositories/theatre.repository";
import { showRepository } from "@/repositories/show.repository";
import { MovieDto, TheatreDto, ScreenDto, ShowDto } from "@/types";

export class AdminService {
  async getDashboardMetrics() {
    return await bookingRepository.getAdminMetrics();
  }

  // Movie CRUD
  async createMovie(data: Omit<MovieDto, "id">) {
    return await movieRepository.create(data);
  }

  async updateMovie(id: string, data: Partial<Omit<MovieDto, "id">>) {
    return await movieRepository.update(id, data);
  }

  async deleteMovie(id: string) {
    return await movieRepository.delete(id);
  }

  // Theatre CRUD
  async getTheatres() {
    return await theatreRepository.findAll();
  }

  async createTheatre(data: Omit<TheatreDto, "id">) {
    return await theatreRepository.create(data);
  }

  async deleteTheatre(id: string) {
    return await theatreRepository.delete(id);
  }

  // Screen CRUD
  async createScreen(data: Omit<ScreenDto, "id">) {
    return await screenRepository.create(data);
  }

  // Show CRUD
  async getShows() {
    return await showRepository.findAll();
  }

  async createShow(data: Omit<ShowDto, "id">) {
    return await showRepository.create(data);
  }

  async deleteShow(id: string) {
    return await showRepository.delete(id);
  }
}

export const adminService = new AdminService();
