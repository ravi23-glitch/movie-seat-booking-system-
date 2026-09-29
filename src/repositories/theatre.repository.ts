import { inMemoryDb } from "@/lib/store";
import { TheatreDto, ScreenDto, SeatDto } from "@/types";

export class TheatreRepository {
  async findAll(): Promise<TheatreDto[]> {
    return Array.from(inMemoryDb.state.theatres.values());
  }

  async findById(id: string): Promise<TheatreDto | null> {
    return inMemoryDb.state.theatres.get(id) || null;
  }

  async create(data: Omit<TheatreDto, "id">): Promise<TheatreDto> {
    const id = `theatre-${Date.now()}`;
    const theatre = { id, ...data };
    inMemoryDb.state.theatres.set(id, theatre);
    return theatre;
  }

  async delete(id: string): Promise<boolean> {
    return inMemoryDb.state.theatres.delete(id);
  }
}

export class ScreenRepository {
  async findByTheatreId(theatreId: string): Promise<ScreenDto[]> {
    return Array.from(inMemoryDb.state.screens.values()).filter(
      (s) => s.theatreId === theatreId
    );
  }

  async findById(id: string): Promise<ScreenDto | null> {
    return inMemoryDb.state.screens.get(id) || null;
  }

  async create(data: Omit<ScreenDto, "id">): Promise<ScreenDto> {
    const id = `screen-${Date.now()}`;
    const screen = { id, ...data };
    inMemoryDb.state.screens.set(id, screen);
    return screen;
  }
}

export class SeatRepository {
  async findByScreenId(screenId: string): Promise<SeatDto[]> {
    return Array.from(inMemoryDb.state.seats.values()).filter(
      (s) => s.screenId === screenId
    );
  }

  async findById(id: string): Promise<SeatDto | null> {
    return inMemoryDb.state.seats.get(id) || null;
  }
}

export const theatreRepository = new TheatreRepository();
export const screenRepository = new ScreenRepository();
export const seatRepository = new SeatRepository();
