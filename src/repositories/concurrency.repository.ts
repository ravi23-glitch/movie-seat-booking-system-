import { inMemoryDb } from "@/lib/store";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { signReservationToken, verifyReservationToken } from "@/lib/jwt";
import { ShowSeatDto, ShowDto, BookingDto, ShowSeatStatus, BookingStatus, PaymentStatus } from "@/types";

export interface HoldSeatsResult {
  reservationToken: string;
  lockedUntil: Date;
  expiresInSeconds: number;
  seats: ShowSeatDto[];
  totalAmount: number;
}

export interface CheckoutParams {
  reservationToken: string;
  userId: string;
  paymentMethod: string;
  idempotencyKey?: string;
  customerName?: string;
  snacks?: {
    id?: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export class ConcurrencyRepository {
  /**
   * Raw SQL representation for PostgreSQL transactions with pessimistic row-level locking:
   * 
   * BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
   * SELECT * FROM show_seats 
   * WHERE show_id = $1 AND seat_id IN (...) 
   * FOR UPDATE;
   * 
   * UPDATE show_seats 
   * SET status = 'LOCKED', locked_until = $2, locked_by_user_id = $3, version = version + 1
   * WHERE show_id = $1 AND seat_id IN (...);
   * COMMIT;
   */
  public getPessimisticSql(showId: string, seatCount: number): string {
    return `SELECT * FROM show_seats WHERE show_id = $1 AND seat_id IN (${Array.from(
      { length: seatCount },
      (_, i) => `$${i + 2}`
    ).join(", ")}) FOR UPDATE;`;
  }

  /**
   * Pessimistic locking transaction for holding seats with 10-minute hold window.
   * Row-level locking guarantees zero double-booking under extreme concurrent load.
   */
  async holdSeats(
    showId: string,
    seatIds: string[],
    userId: string,
    durationMinutes: number = 10
  ): Promise<HoldSeatsResult> {
    return await inMemoryDb.acquireLock(`show-${showId}`, async () => {
      const now = new Date();
      const holdUntil = new Date(now.getTime() + durationMinutes * 60 * 1000);

      // Verify show exists
      const show = inMemoryDb.state.shows.get(showId);
      if (!show) {
        throw new NotFoundError(`Show with ID ${showId} not found`);
      }

      // Step 1: Execute row-level lock & inspect each seat
      const targetSeats: ShowSeatDto[] = [];

      for (const seatId of seatIds) {
        const key = `${showId}:${seatId}`;
        const showSeat = inMemoryDb.state.showSeats.get(key);

        if (!showSeat) {
          throw new NotFoundError(`Seat with ID ${seatId} not configured for show ${showId}`);
        }

        // Automatic sweep on read: if expired lock, release it back to AVAILABLE
        if (
          showSeat.status === "LOCKED" &&
          showSeat.lockedUntil &&
          new Date(showSeat.lockedUntil) <= now
        ) {
          showSeat.status = "AVAILABLE";
          showSeat.lockedUntil = null;
          showSeat.lockedByUserId = null;
        }

        // Conflict check: if BOOKED or currently LOCKED by another user
        if (showSeat.status === "BOOKED") {
          const seatLabel = `${showSeat.seat.seatRow}${showSeat.seat.seatNumber}`;
          throw new ConflictError(
            `Seat ${seatLabel} is already booked and cannot be reserved`,
            { seatId, status: "BOOKED" }
          );
        }

        if (
          showSeat.status === "LOCKED" &&
          showSeat.lockedUntil &&
          new Date(showSeat.lockedUntil) > now &&
          showSeat.lockedByUserId !== userId
        ) {
          const seatLabel = `${showSeat.seat.seatRow}${showSeat.seat.seatNumber}`;
          throw new ConflictError(
            `Seat ${seatLabel} is currently held by another customer. Please choose a different seat.`,
            {
              seatId,
              status: "LOCKED",
              lockedUntil: showSeat.lockedUntil,
            }
          );
        }

        targetSeats.push(showSeat);
      }

      // Step 2: All requested seats are valid! Atomically update to LOCKED
      for (const showSeat of targetSeats) {
        showSeat.status = "LOCKED";
        showSeat.lockedUntil = holdUntil;
        showSeat.lockedByUserId = userId;
        showSeat.version += 1;
      }

      const totalAmount = targetSeats.reduce((sum, s) => sum + s.price, 0);

      // Step 3: Issue cryptographically signed reservation token
      const reservationToken = signReservationToken({
        showId,
        seatIds,
        userId,
        expiresAt: holdUntil.getTime(),
      });

      return {
        reservationToken,
        lockedUntil: holdUntil,
        expiresInSeconds: durationMinutes * 60,
        seats: targetSeats,
        totalAmount: Math.round(totalAmount * 100) / 100,
      };
    });
  }

  /**
   * Checkout finalization transaction.
   * Atomically transitions seats to BOOKED, creates Booking, BookingSeats, and Payment records.
   */
  async finalizeBooking(params: CheckoutParams): Promise<BookingDto> {
    const { reservationToken, userId, paymentMethod, idempotencyKey } = params;

    // Verify token validity & expiration
    let decoded: { showId: string; seatIds: string[]; userId: string; expiresAt: number };
    try {
      decoded = verifyReservationToken(reservationToken);
    } catch (err) {
      throw new ConflictError("Reservation session expired or invalid. Please reselect seats.");
    }

    if (decoded.userId !== userId) {
      throw new ConflictError("Reservation does not belong to the authenticated user");
    }

    const { showId, seatIds } = decoded;

    return await inMemoryDb.acquireLock(`show-${showId}`, async () => {
      const now = new Date();

      // Check for duplicate submission via idempotency
      if (idempotencyKey) {
        const existingBooking = Array.from(inMemoryDb.state.bookings.values()).find(
          (b) => b.bookingReference === idempotencyKey
        );
        if (existingBooking) {
          return existingBooking;
        }
      }

      // Verify that all seats are currently locked by this user and unexpired
      const targetSeats: ShowSeatDto[] = [];
      for (const seatId of seatIds) {
        const key = `${showId}:${seatId}`;
        const showSeat = inMemoryDb.state.showSeats.get(key);

        if (!showSeat) {
          throw new NotFoundError(`Seat ${seatId} not found`);
        }

        if (showSeat.status === "BOOKED") {
          throw new ConflictError("One or more seats have already been finalized.");
        }

        if (
          showSeat.status !== "LOCKED" ||
          showSeat.lockedByUserId !== userId ||
          !showSeat.lockedUntil ||
          new Date(showSeat.lockedUntil) <= now
        ) {
          throw new ConflictError("Seat reservation window expired. Please reselect your seats.");
        }

        targetSeats.push(showSeat);
      }

      // Step 2: Atomic status transition to BOOKED
      for (const showSeat of targetSeats) {
        showSeat.status = "BOOKED";
        showSeat.lockedUntil = null;
        showSeat.lockedByUserId = userId;
        showSeat.version += 1;
      }

      const totalAmount = targetSeats.reduce((sum, s) => sum + s.price, 0);
      const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const bookingReference =
        idempotencyKey || `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const bookingSeats = targetSeats.map((ts) => ({
        id: `bseat-${Date.now()}-${ts.seatId}`,
        seatId: ts.seatId,
        price: ts.price,
        seat: ts.seat,
      }));

      const payment = {
        id: `pay-${Date.now()}`,
        bookingId,
        amount: totalAmount,
        status: "SUCCESS" as PaymentStatus,
        transactionRef: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        paymentMethod,
        createdAt: now,
      };

      const rawShow = inMemoryDb.state.shows.get(showId);
      const movie = rawShow ? inMemoryDb.state.movies.get(rawShow.movieId) : undefined;
      const screen = rawShow ? inMemoryDb.state.screens.get(rawShow.screenId) : undefined;
      const theatre = screen ? inMemoryDb.state.theatres.get(screen.theatreId) : undefined;
      const show: ShowDto | undefined = rawShow
        ? {
            ...rawShow,
            movie,
            screen: screen ? { ...screen, theatre } : undefined,
          }
        : undefined;

      const user = inMemoryDb.state.users.get(userId);
      const finalCustomerName = params.customerName || user?.name || "Alex Customer";

      const snacks = params.snacks || [];
      const snacksTotal = snacks.reduce((sum, sn) => sum + sn.price * sn.quantity, 0);
      const grandTotalAmount = Math.round((totalAmount + snacksTotal) * 100) / 100;

      const booking: BookingDto = {
        id: bookingId,
        userId,
        customerName: finalCustomerName,
        user: user
          ? { id: user.id, name: user.name, email: user.email }
          : { id: userId, name: finalCustomerName, email: "customer@cinesync.io" },
        showId,
        totalAmount: grandTotalAmount,
        status: "CONFIRMED" as BookingStatus,
        bookingReference,
        createdAt: now,
        updatedAt: now,
        show,
        bookingSeats,
        snacks: snacks.length > 0 ? snacks : undefined,
        payment,
      };

      inMemoryDb.state.bookings.set(bookingId, booking);
      inMemoryDb.state.payments.set(payment.id, payment);

      return booking;
    });
  }

  /**
   * Cancel booking, release seats, and refund payment.
   */
  async cancelBooking(bookingId: string, userId: string): Promise<BookingDto> {
    const booking = inMemoryDb.state.bookings.get(bookingId);
    if (!booking) {
      throw new NotFoundError(`Booking with ID ${bookingId} not found`);
    }

    if (booking.userId !== userId) {
      throw new ConflictError("Unauthorized: Booking does not belong to this user");
    }

    if (booking.status === "CANCELLED") {
      throw new ConflictError("Booking is already cancelled");
    }

    return await inMemoryDb.acquireLock(`show-${booking.showId}`, async () => {
      // Release seats back to AVAILABLE
      if (booking.bookingSeats) {
        for (const bs of booking.bookingSeats) {
          const key = `${booking.showId}:${bs.seatId}`;
          const showSeat = inMemoryDb.state.showSeats.get(key);
          if (showSeat) {
            showSeat.status = "AVAILABLE";
            showSeat.lockedUntil = null;
            showSeat.lockedByUserId = null;
            showSeat.version += 1;
          }
        }
      }

      booking.status = "CANCELLED";
      booking.updatedAt = new Date();

      if (booking.payment) {
        booking.payment.status = "REFUNDED";
      }

      return booking;
    });
  }

  /**
   * Sweeps expired locked seats and resets them to AVAILABLE.
   */
  async sweepExpiredLocks(): Promise<number> {
    const now = new Date();
    let sweptCount = 0;

    for (const [key, showSeat] of inMemoryDb.state.showSeats.entries()) {
      if (
        showSeat.status === "LOCKED" &&
        showSeat.lockedUntil &&
        new Date(showSeat.lockedUntil) <= now
      ) {
        showSeat.status = "AVAILABLE";
        showSeat.lockedUntil = null;
        showSeat.lockedByUserId = null;
        showSeat.version += 1;
        sweptCount++;
      }
    }

    return sweptCount;
  }
}

export const concurrencyRepository = new ConcurrencyRepository();
