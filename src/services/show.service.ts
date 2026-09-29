import { inMemoryDb } from "@/lib/store";
import { showRepository } from "@/repositories/show.repository";
import { NotFoundError } from "@/lib/errors";
import { ShowDto, ShowSeatDto } from "@/types";

export class ShowService {
  async getShowSeats(showId: string): Promise<{
    show: ShowDto;
    seats: ShowSeatDto[];
    totalSeats: number;
    availableSeats: number;
    lockedSeats: number;
    bookedSeats: number;
  }> {
    const show = await showRepository.findById(showId);
    if (!show) {
      throw new NotFoundError(`Show with ID ${showId} not found`);
    }

    const now = new Date();
    // Retrieve all show_seats for this show
    const seats: ShowSeatDto[] = [];

    for (const [key, showSeat] of inMemoryDb.state.showSeats.entries()) {
      if (key.startsWith(`${showId}:`)) {
        // Dynamic sweep of expired locks
        if (
          showSeat.status === "LOCKED" &&
          showSeat.lockedUntil &&
          new Date(showSeat.lockedUntil) <= now
        ) {
          showSeat.status = "AVAILABLE";
          showSeat.lockedUntil = null;
          showSeat.lockedByUserId = null;
        }

        seats.push(showSeat);
      }
    }

    // Sort seats by row and number
    seats.sort((a, b) => {
      if (a.seat.seatRow === b.seat.seatRow) {
        return a.seat.seatNumber - b.seat.seatNumber;
      }
      return a.seat.seatRow.localeCompare(b.seat.seatRow);
    });

    const availableSeats = seats.filter((s) => s.status === "AVAILABLE").length;
    const lockedSeats = seats.filter((s) => s.status === "LOCKED").length;
    const bookedSeats = seats.filter((s) => s.status === "BOOKED").length;

    return {
      show,
      seats,
      totalSeats: seats.length,
      availableSeats,
      lockedSeats,
      bookedSeats,
    };
  }

  async getAllShows(): Promise<ShowDto[]> {
    return await showRepository.findAll();
  }

  async createShow(data: Omit<ShowDto, "id">): Promise<ShowDto> {
    return await showRepository.create(data);
  }

  async deleteShow(id: string): Promise<boolean> {
    return await showRepository.delete(id);
  }
}

export const showService = new ShowService();
