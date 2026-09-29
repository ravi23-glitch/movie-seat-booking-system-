import { inMemoryDb } from "@/lib/store";
import { ShowDto, ShowSeatDto } from "@/types";

export class ShowRepository {
  async findByMovieId(movieId: string): Promise<ShowDto[]> {
    const shows = Array.from(inMemoryDb.state.shows.values()).filter(
      (s) => s.movieId === movieId
    );
    return shows.map((show) => this.hydrateShow(show));
  }

  async findById(id: string): Promise<ShowDto | null> {
    const show = inMemoryDb.state.shows.get(id);
    if (!show) return null;
    return this.hydrateShow(show);
  }

  async findAll(): Promise<ShowDto[]> {
    const shows = Array.from(inMemoryDb.state.shows.values());
    return shows.map((show) => this.hydrateShow(show));
  }

  async create(data: Omit<ShowDto, "id">): Promise<ShowDto> {
    const id = `show-${Date.now()}`;
    const show: ShowDto = { id, ...data };
    inMemoryDb.state.shows.set(id, show);

    // Initialize ShowSeats for this show
    const screenSeats = Array.from(inMemoryDb.state.seats.values()).filter(
      (s) => s.screenId === data.screenId
    );
    screenSeats.forEach((seat) => {
      const showSeatId = `ss-${id}-${seat.id}`;
      const showSeat: ShowSeatDto = {
        id: showSeatId,
        showId: id,
        seatId: seat.id,
        status: "AVAILABLE",
        lockedUntil: null,
        lockedByUserId: null,
        version: 0,
        seat,
        price: Math.round(seat.basePrice * data.priceMultiplier * 100) / 100,
      };
      inMemoryDb.state.showSeats.set(`${id}:${seat.id}`, showSeat);
    });

    return this.hydrateShow(show);
  }

  async delete(id: string): Promise<boolean> {
    inMemoryDb.state.shows.delete(id);
    // Cleanup show seats
    for (const key of inMemoryDb.state.showSeats.keys()) {
      if (key.startsWith(`${id}:`)) {
        inMemoryDb.state.showSeats.delete(key);
      }
    }
    return true;
  }

  private hydrateShow(show: ShowDto): ShowDto {
    const movie = inMemoryDb.state.movies.get(show.movieId);
    const screen = inMemoryDb.state.screens.get(show.screenId);
    let theatre = undefined;
    if (screen) {
      theatre = inMemoryDb.state.theatres.get(screen.theatreId);
    }
    return {
      ...show,
      movie,
      screen: screen ? { ...screen, theatre } : undefined,
    };
  }
}

export const showRepository = new ShowRepository();
