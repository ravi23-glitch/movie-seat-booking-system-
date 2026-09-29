import bcrypt from "bcryptjs";
import {
  UserDto,
  MovieDto,
  TheatreDto,
  ScreenDto,
  SeatDto,
  ShowDto,
  ShowSeatDto,
  BookingDto,
  BookingStatus,
  PaymentStatus,
  ShowSeatStatus,
} from "@/types";
import { INITIAL_MOVIES, INITIAL_THEATRES, INITIAL_SCREENS } from "./seed-data";

export interface InMemoryState {
  users: Map<string, UserDto & { passwordHash: string }>;
  movies: Map<string, MovieDto>;
  theatres: Map<string, TheatreDto>;
  screens: Map<string, ScreenDto>;
  seats: Map<string, SeatDto>;
  shows: Map<string, ShowDto>;
  showSeats: Map<string, ShowSeatDto>; // key: `${showId}:${seatId}`
  bookings: Map<string, BookingDto>;
  payments: Map<string, any>;
  locks: Map<string, Promise<void>>; // Mutex locks for atomic row transactions
}

class InMemoryDatabase {
  private static instance: InMemoryDatabase;
  public state: InMemoryState;
  private initialized: boolean = false;
  private mutexLock: Promise<void> = Promise.resolve();

  private constructor() {
    this.state = {
      users: new Map(),
      movies: new Map(),
      theatres: new Map(),
      screens: new Map(),
      seats: new Map(),
      shows: new Map(),
      showSeats: new Map(),
      bookings: new Map(),
      payments: new Map(),
      locks: new Map(),
    };
    this.seed();
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  public async acquireLock<T>(key: string, task: () => Promise<T>): Promise<T> {
    // Acquire sequential mutex for critical row-level pessimistic locking
    let unlock: () => void;
    const prevLock = this.mutexLock;
    this.mutexLock = new Promise<void>((resolve) => {
      unlock = resolve;
    });

    await prevLock;
    try {
      return await task();
    } finally {
      unlock!();
    }
  }

  public seed(): void {
    if (this.initialized) return;

    // 1. Users
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync("admin123", salt);
    const customerHash = bcrypt.hashSync("customer123", salt);

    const adminUser: UserDto & { passwordHash: string } = {
      id: "user-admin",
      name: "Cinema Admin",
      email: "admin@cinema.com",
      role: "ADMIN",
      passwordHash: adminHash,
      createdAt: new Date(),
    };
    const customerUser: UserDto & { passwordHash: string } = {
      id: "user-customer",
      name: "Alex Customer",
      email: "alex@example.com",
      role: "USER",
      passwordHash: customerHash,
      createdAt: new Date(),
    };
    const customerUser2: UserDto & { passwordHash: string } = {
      id: "user-customer-2",
      name: "Sarah Parker",
      email: "sarah@example.com",
      role: "USER",
      passwordHash: customerHash,
      createdAt: new Date(),
    };

    this.state.users.set(adminUser.id, adminUser);
    this.state.users.set(customerUser.id, customerUser);
    this.state.users.set(customerUser2.id, customerUser2);

    // 2. Movies
    INITIAL_MOVIES.forEach((m) => {
      this.state.movies.set(m.id, {
        id: m.id,
        title: m.title,
        description: m.description,
        posterUrl: m.posterUrl,
        backdropUrl: m.backdropUrl,
        durationMin: m.durationMin,
        rating: m.rating,
        genre: m.genre,
        releaseDate: new Date(m.releaseDate),
      });
    });

    // 3. Theatres
    INITIAL_THEATRES.forEach((t) => {
      this.state.theatres.set(t.id, t);
    });

    // 4. Screens & Seats
    INITIAL_SCREENS.forEach((scr) => {
      this.state.screens.set(scr.id, {
        id: scr.id,
        theatreId: scr.theatreId,
        screenNumber: scr.screenNumber,
        totalSeats: scr.totalSeats,
      });

      // Populate seats (50+ seats per screen)
      scr.rows.forEach((row, rowIdx) => {
        for (let num = 1; num <= scr.seatsPerRow; num++) {
          const seatId = `seat-${scr.id}-${row}${num}`;
          const isPremium = rowIdx >= Math.floor(scr.rows.length / 2);
          const basePrice = isPremium ? 350.0 : 220.0;

          const seat: SeatDto = {
            id: seatId,
            screenId: scr.id,
            seatRow: row,
            seatNumber: num,
            seatType: isPremium ? "PREMIUM" : "REGULAR",
            basePrice,
          };
          this.state.seats.set(seatId, seat);
        }
      });
    });

    // 5. Shows
    // Create multiple scheduled shows (Today and Tomorrow) across screens
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const showSlots = [
      { hour: 10, minute: 30, duration: 160, multiplier: 1.0 },
      { hour: 14, minute: 15, duration: 170, multiplier: 1.1 },
      { hour: 18, minute: 0, duration: 180, multiplier: 1.3 },
      { hour: 21, minute: 45, duration: 165, multiplier: 1.4 },
    ];

    let showIndex = 1;
    const movieIds = INITIAL_MOVIES.map((m) => m.id);

    // Schedule for day 0 (today), day 1 (tomorrow), and day 2
    for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
      INITIAL_SCREENS.forEach((screen, screenIdx) => {
        showSlots.forEach((slot, slotIdx) => {
          const movieId = movieIds[(screenIdx + slotIdx + dayOffset) % movieIds.length];
          const startTime = new Date(today.getTime() + dayOffset * 86400000);
          startTime.setHours(slot.hour, slot.minute, 0, 0);

          const endTime = new Date(startTime.getTime() + slot.duration * 60000);
          const showId = `show-${showIndex++}`;

          const show: ShowDto = {
            id: showId,
            movieId,
            screenId: screen.id,
            startTime,
            endTime,
            priceMultiplier: slot.multiplier,
          };
          this.state.shows.set(showId, show);

          // Populate ShowSeats for this show
          const screenSeats = Array.from(this.state.seats.values()).filter(
            (s) => s.screenId === screen.id
          );

          screenSeats.forEach((seat, seatIdx) => {
            const showSeatId = `ss-${showId}-${seat.id}`;
            // Mark a few seats as booked initially for realistic occupancy feel
            const isInitiallyBooked = seatIdx === 12 || seatIdx === 13;

            const showSeat: ShowSeatDto = {
              id: showSeatId,
              showId,
              seatId: seat.id,
              status: isInitiallyBooked ? "BOOKED" : "AVAILABLE",
              lockedUntil: null,
              lockedByUserId: isInitiallyBooked ? "user-customer" : null,
              version: 0,
              seat,
              price: Math.round(seat.basePrice * slot.multiplier * 100) / 100,
            };
            this.state.showSeats.set(`${showId}:${seat.id}`, showSeat);
          });
        });
      });
    }

    this.initialized = true;
    console.log(`[Database Seed] Initialized in-memory store with ${this.state.movies.size} movies, ${this.state.theatres.size} theatres, ${this.state.screens.size} screens, ${this.state.seats.size} seats, ${this.state.shows.size} shows, and ${this.state.showSeats.size} show-seats.`);
  }
}

export const inMemoryDb = InMemoryDatabase.getInstance();
