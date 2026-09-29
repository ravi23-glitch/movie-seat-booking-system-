import { concurrencyRepository } from "@/repositories/concurrency.repository";
import { bookingRepository } from "@/repositories/booking.repository";
import { BookingDto, BookingStatus } from "@/types";

export class BookingService {
  async lockSeats(showId: string, seatIds: string[], userId: string) {
    const durationMinutes = parseInt(process.env.SEAT_LOCK_DURATION_MINUTES || "10", 10);
    return await concurrencyRepository.holdSeats(showId, seatIds, userId, durationMinutes);
  }

  async confirmBooking(params: {
    reservationToken: string;
    userId: string;
    paymentMethod: string;
    idempotencyKey?: string;
    customerName?: string;
    snacks?: { id?: string; name: string; quantity: number; price: number }[];
  }): Promise<BookingDto> {
    return await concurrencyRepository.finalizeBooking(params);
  }

  async cancelBooking(bookingId: string, userId: string): Promise<BookingDto> {
    return await concurrencyRepository.cancelBooking(bookingId, userId);
  }

  async getUserBookings(userId: string, status?: BookingStatus): Promise<BookingDto[]> {
    return await bookingRepository.findByUserId(userId, status);
  }

  async getBookingById(bookingId: string): Promise<BookingDto | null> {
    return await bookingRepository.findById(bookingId);
  }
}

export const bookingService = new BookingService();
